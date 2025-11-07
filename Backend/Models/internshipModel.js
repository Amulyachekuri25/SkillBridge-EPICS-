const db = require("../db");

async function saveInternship(item) {
  const query = `
    INSERT INTO internships 
      (title, company,company_url, apply_link, eligibility, skills,scraped_at)
    VALUES (?, ?, ?, ?, ?, ?,NOW())
    ON DUPLICATE KEY UPDATE
    company = VALUES(company),
      company_url = VALUES(company_url),
      apply_link = VALUES(apply_link),
      eligibility = VALUES(eligibility),
      skills = VALUES(skills),
      scraped_at = NOW()
  `;
  await db.execute(query, [
    item.title,
    item.company,
    item.company_url,
    item.apply_link,
    item.eligibility,
    item.skills
  ]);
}

module.exports = { saveInternship };

