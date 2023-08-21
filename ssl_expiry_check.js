const axios = require('axios');
const { SLACK_WEBHOOK_URL, DOMAINS_TO_CHECK } = process.env;

const domainsToCheck = DOMAINS_TO_CHECK.split(',');

async function checkExpiry(domain) {
  try {
    const { stdout } = await exec(`openssl s_client -servername ${domain} -connect ${domain}:443 < /dev/null 2>/dev/null | openssl x509 -noout -enddate`);
    const endDateStr = stdout.trim().replace('notAfter=', '');
    const endDate = new Date(endDateStr);
    const currentDate = new Date();

    // Calculate the remaining days
    const remainingTime = endDate - currentDate;
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    return remainingDays;
  } catch (error) {
    console.error('SSL check error:', error.message);
    return -1; // Return a negative value to indicate an error
  }
}

async function exec(command) {
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  return exec(command);
}

(async () => {
  for (const domain of domainsToCheck) {
    const remainingDays = await checkExpiry(domain.trim());
    if (remainingDays >= 0) {
      const message = `SSL Expiry Alert\n` +
                      `* Domain : ${domain}\n` +
                      `* Warning : The SSL certificate for ${domain} will expire in ${remainingDays} days.`;

      try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
      } catch (error) {
        console.error('Error sending Slack notification:', error);
      }
    }
  }
})();
