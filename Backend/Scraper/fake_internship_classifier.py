"""
K-Means Clustering Module for Classifying Genuine vs Fake Internships
Analyzes internship data and classifies based on textual features and stipend
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from scipy.sparse import hstack
import mysql.connector
import os


# ===============================================================
#                 DATABASE CONNECTION
# ===============================================================
def get_db_connection():
    """Create database connection"""
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="pass123",
            database="skillbridge",
            autocommit=False
        )
        return conn
    except mysql.connector.Error as err:
        print(f"✗ Database Connection Error: {err}")
        return None

# ===============================================================
#                 CLASSIFICATION FUNCTIONS
# ===============================================================
def load_internships_from_csv(csv_path='internships.csv'):
    """Load internships from CSV file"""
    try:
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df)} internships from {csv_path}")
        return df
    except FileNotFoundError:
        print(f"✗ CSV file not found: {csv_path}")
        return None
    except Exception as e:
        print(f"✗ Error loading CSV: {e}")
        return None

def load_internships_from_db():
    """Load internships from database"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT id, title, company, company_url, skills, eligibility, stipend 
            FROM internships 
            WHERE source = 'unstop'
        """)
        
        columns = [desc[0] for desc in cursor.description]
        data = cursor.fetchall()
        
        df = pd.DataFrame(data, columns=columns)
        print(f"✓ Loaded {len(df)} internships from database")
        cursor.close()
        conn.close()
        return df
    except Exception as e:
        print(f"✗ Error loading from database: {e}")
        return None

def preprocess_data(df):
    """Preprocess dataframe for clustering"""
    # Select relevant columns
    required_cols = ['title', 'company', 'company_url', 'skills', 'eligibility', 'stipend']
    
    # Check which columns exist
    available_cols = [col for col in required_cols if col in df.columns]
    
    if len(available_cols) < 5:
        print(f"⚠ Warning: Missing some columns. Found: {available_cols}")
    
    # Select available columns, with defaults for missing ones
    df_processed = df.copy()
    
    text_cols = ['title', 'company', 'company_url', 'skills', 'eligibility']
    for col in text_cols:
        if col in df_processed.columns:
            df_processed[col] = df_processed[col].fillna('')
        else:
            df_processed[col] = ''
    
    if 'stipend' in df_processed.columns:
        df_processed['stipend'] = pd.to_numeric(df_processed['stipend'], errors='coerce').fillna(0)
    else:
        df_processed['stipend'] = 0
    
    # Create combined text feature
    df_processed['text'] = (
        df_processed['title'] + ' ' +
        df_processed.get('skills', '').astype(str) + ' ' +
        df_processed.get('eligibility', '').astype(str) + ' ' +
        df_processed.get('company', '').astype(str)
    )
    
    return df_processed

def classify_internships(df, n_clusters=2):
    """
    Classify internships using K-Means clustering
    
    Args:
        df: DataFrame with internship data
        n_clusters: Number of clusters (default: 2 for Fake/Genuine)
    
    Returns:
        DataFrame with added cluster and classification columns
    """
    print("\n" + "="*60)
    print("Starting K-Means Clustering...")
    print("="*60)
    
    # Preprocess data
    df = preprocess_data(df)
    
    # TF-IDF Vectorization
    print("\n1. Extracting TF-IDF features from text...")
    tfidf = TfidfVectorizer(
        stop_words='english',
        max_features=400,
        min_df=1,
        max_df=0.9
    )
    
    X_text = tfidf.fit_transform(df['text'])
    print(f"   ✓ TF-IDF matrix shape: {X_text.shape}")
    
    # Standardize stipend feature
    print("\n2. Standardizing stipend feature...")
    scaler = StandardScaler()
    X_stipend = scaler.fit_transform(df[['stipend']])
    print(f"   ✓ Stipend scaled. Range: [{X_stipend.min():.2f}, {X_stipend.max():.2f}]")
    
    # Combine features
    print("\n3. Combining features...")
    X = hstack([X_text, X_stipend])
    print(f"   ✓ Combined feature matrix shape: {X.shape}")
    
    # K-Means Clustering
    print(f"\n4. Running K-Means with {n_clusters} clusters...")
    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10,
        max_iter=300
    )
    
    df['cluster'] = kmeans.fit_predict(X)
    print(f"   ✓ Clustering complete")
    
    # Analyze clusters
    print("\n5. Cluster Analysis:")
    cluster_stats = df.groupby('cluster').agg({
        'stipend': ['mean', 'min', 'max', 'count'],
        'title': 'count'
    })
    print(cluster_stats)
    
    # Map clusters to labels
    print("\n6. Mapping clusters to labels...")
    
    # Determine which cluster is genuine based on stipend mean
    cluster_stipends = df.groupby('cluster')['stipend'].mean()
    
    # Higher stipend cluster is more likely genuine
    genuine_cluster = cluster_stipends.idxmax()
    fake_cluster = cluster_stipends.idxmin()
    
    cluster_map = {
        genuine_cluster: 'Genuine Internship',
        fake_cluster: 'Fake Internship'
    }
    
    print(f"   Cluster {genuine_cluster} (avg stipend: ₹{cluster_stipends[genuine_cluster]:.0f}) → Genuine")
    print(f"   Cluster {fake_cluster} (avg stipend: ₹{cluster_stipends[fake_cluster]:.0f}) → Fake")
    
    df['internship_status'] = df['cluster'].map(cluster_map)
    
    # Summary statistics
    print("\n7. Classification Summary:")
    status_counts = df['internship_status'].value_counts()
    print(status_counts)
    
    return df

def update_database_with_classification(df, remove_fake=True):
    """
    Update database with classification results
    
    Args:
        df: DataFrame with classification results
        remove_fake: If True, delete fake internships from database; if False, just mark them
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        fake_ids = []
        genuine_ids = []
        
        for idx, row in df.iterrows():
            if 'id' in row and row['id']:
                if row['internship_status'] == 'Fake Internship':
                    fake_ids.append(row['id'])
                else:
                    genuine_ids.append(row['id'])
        
        # Delete fake internships
        if remove_fake and fake_ids:
            print(f"\n🗑️  Removing {len(fake_ids)} fake internships from database...")
            placeholders = ','.join(['%s'] * len(fake_ids))
            cursor.execute(f"DELETE FROM internships WHERE id IN ({placeholders})", fake_ids)
            conn.commit()
            print(f"✓ Deleted {cursor.rowcount} fake internships")
        
        # Update genuine internships with status
        if genuine_ids:
            print(f"\n✓ Marking {len(genuine_ids)} genuine internships in database...")
            placeholders = ','.join(['%s'] * len(genuine_ids))
            cursor.execute(f"UPDATE internships SET internship_status = 'Genuine Internship' WHERE id IN ({placeholders})", genuine_ids)
            conn.commit()
            print(f"✓ Updated {cursor.rowcount} genuine internships")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"\n✗ Error updating database: {e}")
        return False

def save_classification_results(df, output_path='internships_classified.csv'):
    """Save classification results to CSV"""
    try:
        # Select relevant columns
        output_cols = ['title', 'company', 'skills', 'eligibility', 'stipend', 'internship_status']
        output_cols = [col for col in output_cols if col in df.columns]
        
        df[output_cols].to_csv(output_path, index=False)
        print(f"✓ Classification results saved to {output_path}")
        return True
    except Exception as e:
        print(f"✗ Error saving results: {e}")
        return False

def classify_from_csv(csv_path='internships.csv', output_path='internships_classified.csv'):
    """Main function to classify internships from CSV"""
    # Load data
    df = load_internships_from_csv(csv_path)
    if df is None:
        return None
    
    # Classify
    df_classified = classify_internships(df)
    
    # Save results
    save_classification_results(df_classified, output_path)
    
    return df_classified

def classify_from_database(update_db=True, remove_fake=True):
    """
    Main function to classify internships from database
    
    Args:
        update_db: If True, update database with results
        remove_fake: If True, delete fake internships from database
    """
    # Load data
    df = load_internships_from_db()
    if df is None:
        return None
    
    # Classify
    df_classified = classify_internships(df)
    
    # Update database if requested
    if update_db:
        update_database_with_classification(df_classified, remove_fake=remove_fake)
    
    # Save results (only genuine if remove_fake=True)
    if remove_fake:
        df_genuine = df_classified[df_classified['internship_status'] == 'Genuine Internship']
        save_classification_results(df_genuine, 'internships_classified_genuine.csv')
    else:
        save_classification_results(df_classified, 'internships_classified.csv')
    
    return df_classified

# ===============================================================
#                 MAIN EXECUTION
# ===============================================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("INTERNSHIP CLASSIFICATION & CLEANING MODULE")
    print("="*60)
    
    # Try to load from database first, fallback to CSV
    print("\nAttempting to load internships from database...")
    df = load_internships_from_db()
    
    if df is None or len(df) == 0:
        print("\nFalling back to CSV file...")
        df = load_internships_from_csv()
    
    if df is not None and len(df) > 0:
        # Classify internships
        df_classified = classify_internships(df)
        
        # Remove fake internships from database and keep only genuine
        print("\n" + "="*60)
        print("REMOVING FAKE INTERNSHIPS FROM DATABASE")
        print("="*60)
        update_database_with_classification(df_classified, remove_fake=True)
        
        # Save genuine internships only
        df_genuine = df_classified[df_classified['internship_status'] == 'Genuine Internship']
        save_classification_results(df_genuine, 'internships_classified_genuine.csv')
        
        print("\n" + "="*60)
        print("✓ CLASSIFICATION & CLEANING COMPLETE")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   Total internships analyzed: {len(df_classified)}")
        print(f"   Genuine internships kept: {len(df_genuine)}")
        print(f"   Fake internships removed: {len(df_classified) - len(df_genuine)}")
    else:
        print("\n✗ No internship data found. Please run the scraper first.")
