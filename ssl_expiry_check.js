const axios = require('axios');
const { SLACK_WEBHOOK_URL, DOMAINS_TO_CHECK } = process.env;

const domainsToCheck = DOMAINS_TO_CHECK.split(',');

async function checkExpiry(domain) {
  // Implement SSL expiry check logic here
  // Return the remaining days to expiry
}

(async () => {
  for (const domain of domainsToCheck) {
    const remainingDays = await checkExpiry(domain.trim());
    const message = `SSL Expiry Alert\n` +
                    `* Domain : ${domain}\n` +
                    `* Warning : The SSL certificate for ${domain} will expire in ${remainingDays} days.`;

    try {
      await axios.post(SLACK_WEBHOOK_URL, { text: message });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }
})();
