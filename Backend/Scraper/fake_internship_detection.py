# Fake Internship Detection using K-Means Clustering

import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

# ------------------------------
# 1. Load Dataset
# ------------------------------
# Example CSV columns: ['Company', 'Email', 'Website', 'Description', 'Stipend', 'Skills']
data = pd.read_csv('internships.csv')

# ------------------------------
# 2. Preprocessing
# ------------------------------

# Convert categorical features to numeric
le = LabelEncoder()

# Email domain extraction
data['EmailDomain'] = data['Email'].apply(lambda x: x.split('@')[-1])
data['EmailDomain'] = le.fit_transform(data['EmailDomain'])

# Website validity: 1 if website exists, 0 if missing
data['WebsiteValid'] = data['Website'].apply(lambda x: 0 if pd.isna(x) or x.strip() == '' else 1)

# TF-IDF Vectorizer for Description
tfidf = TfidfVectorizer(max_features=50)
desc_features = tfidf.fit_transform(data['Description'].fillna(''))

desc_df = pd.DataFrame(desc_features.toarray(), columns=tfidf.get_feature_names_out())

# Stipend numeric conversion
data['Stipend'] = data['Stipend'].replace('[\₹\,]', '', regex=True).astype(float)
data['Stipend'] = data['Stipend'].fillna(0)

# Skills count (simple numeric feature)
data['SkillCount'] = data['Skills'].apply(lambda x: len(str(x).split(',')))

# Combine features
features = pd.concat([data[['EmailDomain','WebsiteValid','Stipend','SkillCount']], desc_df], axis=1)

# Normalize features
scaler = MinMaxScaler()
X = scaler.fit_transform(features)

# ------------------------------
# 3. K-Means Clustering
# ------------------------------
kmeans = KMeans(n_clusters=2, random_state=42)
data['Cluster'] = kmeans.fit_predict(X)

# ------------------------------
# 4. Determine Cluster Labels
# Cluster 0 → Real, Cluster 1 → Fake (or vice versa, based on majority features)
# ------------------------------
# Check which cluster has more real-looking features
cluster_summary = data.groupby('Cluster')[['WebsiteValid','EmailDomain']].mean()
real_cluster = cluster_summary['WebsiteValid'].idxmax()

data['Result'] = data['Cluster'].apply(lambda x: 'Genuine' if x == real_cluster else 'Fake')

# ------------------------------
# 5. Show Results
# ------------------------------
print(data[['Company','Email','Website','Result']])
