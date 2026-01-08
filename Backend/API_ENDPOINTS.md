# API Endpoints Documentation

## Internship Applications

### 1. Apply for Internship
**POST** `/api/applications/apply`
- Submit an internship application through the app
- **Body:**
  ```json
  {
    "userId": 1,
    "internshipTitle": "Software Engineer Internship",
    "companyName": "Google",
    "resumeUrl": "https://...",
    "coverLetter": "Dear Hiring Team..."
  }
  ```
- **Response:** `{ "message": "Application submitted successfully", "status": "applied" }`

### 2. Verify External Internship Application ⭐ NEW
**POST** `/api/applications/verify-application`
- User confirms they already applied on Unstop/Internshala/LinkedIn and wants to add it to their profile
- **Body:**
  ```json
  {
    "userId": 1,
    "internshipTitle": "Software Engineer Internship",
    "companyName": "Google",
    "source": "Unstop",
    "applicationUrl": "https://unstop.com/...",
    "applicationDate": "2025-12-20"
  }
  ```
- **Response:** 
  ```json
  {
    "message": "Internship application verified and added to your profile",
    "status": "applied",
    "applicationId": 42,
    "source": "Unstop",
    "applicationUrl": "...",
    "appliedAt": "2025-12-20"
  }
  ```
- **Use Case:** Ask user "Did you apply for this internship?" → If Yes, call this endpoint

### 3. Get User Applications
**GET** `/api/applications/user/:userId`
- Fetch all internship applications for a user (for dashboard display)
- **Response:**
  ```json
  [
    {
      "internship_title": "Software Engineer Internship",
      "company_name": "Google",
      "status": "applied"
    }
  ]
  ```

### 4. Get Single Application
**GET** `/api/applications/:applicationId`
- Fetch details of a specific application

### 5. Update Application Status
**PATCH** `/api/applications/:applicationId/status`
- Update status (applied, rejected, shortlisted, selected)
- **Body:** `{ "status": "shortlisted" }`

### 6. Delete Application
**DELETE** `/api/applications/:applicationId`
- Remove an internship application from user profile
- **Response:** `{ "message": "Application removed from profile successfully" }`

---

## Course Enrollments

### 1. Register for Course
**POST** `/api/courses/register`
- User registers for a course through the app
- **Body:**
  ```json
  {
    "userId": 1,
    "courseTitle": "Python for Beginners",
    "skill": "Python",
    "courseUrl": "https://coursera.com/..."
  }
  ```
- **Response:** `{ "message": "Course registration successful", "status": "registered" }`

### 2. Verify Course Enrollment ⭐ NEW
**POST** `/api/courses/verify-enrollment`
- User confirms they enrolled in a course on Coursera/Udemy and wants to add it to their profile
- **Body:**
  ```json
  {
    "userId": 1,
    "courseTitle": "Python for Beginners",
    "skill": "Python",
    "courseUrl": "https://coursera.com/...",
    "enrollmentProof": "certificate_url_or_screenshot"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Course enrollment verified and added to your profile",
    "status": "in_progress",
    "registrationId": 15,
    "proof": "certificate_url_or_screenshot"
  }
  ```
- **Use Case:** Ask user "Did you enroll in this course?" → If Yes, call this endpoint

### 3. Get User Course Registrations
**GET** `/api/courses/registrations/user/:userId`
- Fetch all course registrations for a user (for dashboard)
- **Response:**
  ```json
  [
    {
      "id": 15,
      "course_title": "Python for Beginners",
      "skill": "Python",
      "course_url": "https://coursera.com/...",
      "status": "in_progress",
      "registered_at": "2025-12-20"
    }
  ]
  ```

### 4. Get Single Course Registration
**GET** `/api/courses/registrations/:registrationId`
- Fetch details of a specific course registration

### 5. Update Course Status
**PATCH** `/api/courses/registrations/:registrationId/status`
- Update status (registered, in_progress, completed, dropped)
- **Body:** `{ "status": "completed" }`

### 6. Delete Course Registration
**DELETE** `/api/courses/registrations/:registrationId`
- Remove a course registration from user profile
- **Response:** `{ "message": "Course registration removed successfully" }`

### 7. Search Courses
**GET** `/api/courses/search?skill=python`
- Search for courses by skill (auto-scrapes from Coursera if not found)

### 8. Get All Courses
**GET** `/api/courses/all`
- Get all available courses in database

### 9. Get Available Skills
**GET** `/api/courses/skills`
- Get list of all skills with available courses

---

## Frontend Integration Examples

### Internship Application Verification Flow
```javascript
// Step 1: Show user internship listing
// Step 2: User clicks "I already applied for this"
// Step 3: Show confirmation dialog: "Did you apply for this internship on Unstop/Internshala?"
// Step 4: If Yes, call this:

fetch('/api/applications/verify-application', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    internshipTitle: internship.title,
    companyName: internship.company,
    source: 'Unstop', // or 'Internshala', 'LinkedIn'
    applicationUrl: 'https://unstop.com/internship/...',
    applicationDate: new Date().toISOString()
  })
})
.then(res => res.json())
.then(data => {
  alert('✅ Internship added to your profile!');
  // Refresh user dashboard
  fetchUserApplications();
});
```

### Course Enrollment Verification Flow
```javascript
// Step 1: Show user course listing
// Step 2: User clicks "I already enrolled in this course"
// Step 3: Show confirmation dialog: "Did you enroll in this course on Coursera/Udemy?"
// Step 4: If Yes, call this:

fetch('/api/courses/verify-enrollment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    courseTitle: course.title,
    skill: course.skill,
    courseUrl: course.url,
    enrollmentProof: certificateImageUrl // optional
  })
})
.then(res => res.json())
.then(data => {
  alert('✅ Course added to your profile!');
  // Refresh user dashboard
  fetchUserCourses();
});
```

---

## Database Schema

### student_applications
```
id, user_id, internship_id, internship_title, title, company_name, 
status (applied/rejected/shortlisted/selected), resume_url, cover_letter,
applied_at, updated_at
```

### student_course_registrations
```
id, user_id, course_id, course_title, skill, course_url,
status (registered/in_progress/completed/dropped),
registered_at, updated_at
```
