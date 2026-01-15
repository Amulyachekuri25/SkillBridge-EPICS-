// // const { verifyCompanyUrl } = require("../utils/url_verifier");
// // async function detectFakeInternship(company_url) {
// //   const valid = await verifyCompanyUrl(company_url);
// //   return !valid; // fake if invalid URL
// // }
// // module.exports = detectFakeInternship;
// // Run this file directly with: node detect_fake_internship.js

// const axios = require("axios");
// const cheerio = require("cheerio");
// const dns = require("dns").promises;

// /**
//  * Verifies if a company URL is valid and reachable.
//  * Checks DNS resolution and basic HTTP response.
//  */
// async function verifyCompanyUrl(company_url) {
//   try {
//     // Normalize URL
//     if (!company_url.startsWith("http")) {
//       company_url = "https://" + company_url;
//     }

//     // Check DNS record
//     const hostname = new URL(company_url).hostname;
//     await dns.lookup(hostname);

//     // Check if website is reachable
//     const response = await axios.get(company_url, { timeout: 10000 });
//     return response.status >= 200 && response.status < 400;
//   } catch (err) {
//     return false;
//   }
// }

// /**
//  * Detects if an internship posting might be fake based on company website.
//  */
// async function detectFakeInternship(company_url) {
//   try {
//     // Step 1: Check URL validity
//     const validUrl = await verifyCompanyUrl(company_url);
//     if (!validUrl) {
//       return {
//         isFake: true,
//         reason: "Invalid or unreachable company URL.",
//       };
//     }

//     // Step 2: Fetch website content
//     const { data: html } = await axios.get(company_url, { timeout: 10000 });
//     const $ = cheerio.load(html);
//     const pageText = $("body").text().toLowerCase();

//     // Step 3: Content checks
//     const indicators = {
//       hasAboutPage: html.toLowerCase().includes("about") || pageText.includes("about us"),
//       hasContactInfo: pageText.includes("contact") || pageText.includes("email") || pageText.includes("address"),
//       hasCareerOrInternshipPage: pageText.includes("career") || pageText.includes("internship"),
//       hasSuspiciousKeywords:
//         pageText.includes("earn money fast") ||
//         pageText.includes("no experience needed") ||
//         pageText.includes("work from home and earn daily cash"),
//       hasProfessionalEmail: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(pageText),
//       hasSocialLinks:
//         pageText.includes("linkedin.com") ||
//         pageText.includes("facebook.com") ||
//         pageText.includes("twitter.com") ||
//         pageText.includes("instagram.com"),
//     };

//     // Step 4: Scoring system
//     let score = 0;
//     if (indicators.hasAboutPage) score += 2;
//     if (indicators.hasContactInfo) score += 2;
//     if (indicators.hasCareerOrInternshipPage) score += 1;
//     if (indicators.hasProfessionalEmail) score += 1;
//     if (indicators.hasSocialLinks) score += 1;
//     if (indicators.hasSuspiciousKeywords) score -= 3;

//     // Step 5: Determine authenticity
//     const isFake = score < 2;
//     const reason = isFake
//       ? "Website lacks company details or contains suspicious content."
//       : "Company website appears legitimate based on structure and content.";

//     return {
//       company_url,
//       isFake,
//       score,
//       indicators,
//       reason,
//     };
//   } catch (err) {
//     return {
//       company_url,
//       isFake: true,
//       reason: `Error analyzing company website: ${err.message}`,
//     };
//   }
// }

// module.exports = { detectFakeInternship };

// if (require.main === module) {
//   const url = process.argv[2];
//   if (!url) {
//     console.error("No company URL provided");
//     process.exit(1);
//   }
//   detectFakeInternship(url)
//     .then(result => {
//       console.log(JSON.stringify(result)); // ✅ print JSON to Python
//     })
//     .catch(err => {
//       console.log(JSON.stringify({
//         company_url: url,
//         isFake: true,
//         reason: "Error executing detector: " + err.message
//       }));
//     });
// }
const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;

/**
 * Verifies if a company URL is valid and reachable.
 */
async function verifyCompanyUrl(company_url) {
  try {
    if (!company_url.startsWith("http")) {
      company_url = "https://" + company_url;
    }

    const hostname = new URL(company_url).hostname;
    await dns.lookup(hostname);

    const response = await axios.get(company_url, { timeout: 10000 });
    return response.status >= 200 && response.status < 400;
  } catch (err) {
    return false;
  }
}

/**
 * Detects fake internships based on website legitimacy and content analysis.
 */
async function detectFakeInternship(company_url) {

  // ✅ 1. SKIP detection for Internshala / LinkedIn pages
  if (
    company_url.includes("internshala.com") ||
    company_url.includes("linkedin.com")
  ) {
    return {
      company_url,
      isFake: false,
      reason: "Internal profile / LinkedIn page — skipping fake detection (considered real)."
    };
  }

  try {
    // ✅ 2. Check if URL is reachable
    const validUrl = await verifyCompanyUrl(company_url);
    if (!validUrl) {
      return {
        company_url,
        isFake: true,
        reason: "Website unreachable / invalid URL."
      };
    }

    // ✅ 3. Fetch website content safely
    const { data: html } = await axios.get(company_url, { timeout: 10000 });
    const $ = cheerio.load(html);
    const pageText = $("body").text().toLowerCase();

    // ✅ 4. Content indicators
    const indicators = {
      hasAboutPage: html.toLowerCase().includes("about"),
      hasContactInfo:
        pageText.includes("contact") ||
        pageText.includes("email") ||
        pageText.includes("address") ||
        pageText.includes("phone"),
      hasCareerOrInternshipPage:
        pageText.includes("career") || pageText.includes("internship"),
      hasSuspiciousKeywords:
        pageText.includes("earn money fast") ||
        pageText.includes("work from home and earn daily cash") ||
        pageText.includes("no experience needed"),
      hasProfessionalEmail: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(pageText),
      hasSocialLinks:
        pageText.includes("linkedin.com") ||
        pageText.includes("facebook.com") ||
        pageText.includes("instagram.com") ||
        pageText.includes("twitter.com"),
    };

    // ✅ 5. New Balanced Scoring System
    let score = 0;
    if (indicators.hasAboutPage) score += 2;
    if (indicators.hasContactInfo) score += 2;
    if (indicators.hasCareerOrInternshipPage) score += 1;
    if (indicators.hasProfessionalEmail) score += 1;
    if (indicators.hasSocialLinks) score += 1;
    if (indicators.hasSuspiciousKeywords) score -= 3;

    // ✅ 6. New Threshold (MUCH more accurate)
    // Old: score < 2 (too strict)
    const isFake = score < 0;

    return {
      company_url,
      isFake,
      score,
      indicators,
      reason: isFake
        ? "Website lacks authenticity signals or has suspicious patterns."
        : "Website structure suggests a legitimate organization."
    };

  } catch (err) {
    return {
      company_url,
      isFake: false, // ✅ do NOT mark as fake on network/parse errors
      reason: `Error reading site (not enough evidence to mark fake): ${err.message}`
    };
  }
}

module.exports = { detectFakeInternship };

// Optional CLI runner
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node detect_fake_internship.js <company_url>");
    process.exit(1);
  }
  detectFakeInternship(url).then(res => console.log(JSON.stringify(res, null, 2)));
}
