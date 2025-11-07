const dns = require("dns");
async function verifyCompanyUrl(url) {
  try {
    if (!url || !url.includes(".")) return false;
    const domain = new URL(url).hostname;
    return new Promise(resolve => {
      dns.lookup(domain, (err) => {
        if (err) resolve(false);
        else resolve(true);
      });
    });
  } catch (e) {
    return false;
  }
}
module.exports = { verifyCompanyUrl };