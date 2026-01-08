const axios = require('axios');
(async () => {
  try {
    const resp = await axios.post('http://localhost:5000/api/applications/apply', {
      userId: 12,
      internshipTitle: 'Test Internship via script',
      companyName: 'TestCo',
      resumeUrl: '',
      coverLetter: ''
    }, { timeout: 5000 });
    console.log('Status:', resp.status);
    console.log('Data:', resp.data);
  } catch (err) {
    if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(1);
  }
})();
