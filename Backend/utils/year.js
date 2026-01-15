const CSE_KEYWORDS = require("./cse_keywords");
const yearMap = {
  "1st": 1, "2nd": 2, "3rd": 3, "4th": 4,
  "first": 1, "second": 2, "third": 3, "fourth": 4,
  "pre-final": 3, "final": 4,
  "undergraduate": "UG", "postgraduate": "PG",
  "engineering": "Engineering", "fresher": "Fresher",
  "any": ["UG", "PG", "Engineering", "Fresher"]
};
function predictYear(eligibilityText) 
{
  eligibilityText = eligibilityText.toLowerCase();
  for (let key in yearMap) {
    if (eligibilityText.includes(key)) {
      const value = yearMap[key];
      if (Array.isArray(value)) return [1, 2, 3, 4];
      if (value === "UG" || value === "Engineering") return [1, 2, 3, 4];
      if (value === "PG") return [1, 2];
      if (value === "Fresher") return [4];
      return [value];
    }
  }
  return [];
}
function isCSEInternship(title, skills) {
  const text = (title + " " + skills).toLowerCase();
  return CSE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

module.exports = { predictYear, isCSEInternship };
