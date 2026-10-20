const logger = require('../config/logger');

const DARAJA_BASE_URL = process.env.DARAJA_ENVIRONMENT === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';

let cachedToken = null;
let tokenExpiry = 0;

async function getOAuthToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('Daraja consumer key or secret not configured');
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Daraja OAuth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (parseInt(data.expires_in) - 60) * 1000;

  return cachedToken;
}

function formatPhone(phone) {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

const darajaService = {
  async sendSms(phone, message) {
    const shortcode = process.env.DARAJA_SHORTCODE;
    if (!shortcode) {
      logger.warn('Daraja shortcode not configured — OTP not sent via SMS');
      return false;
    }

    try {
      const token = await getOAuthToken();
      const formattedPhone = formatPhone(phone);

      const response = await fetch(`${DARAJA_BASE_URL}/messaging/v1/send/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: shortcode,
          to: formattedPhone,
          text: message,
          keyword: 'OTP',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Daraja SMS failed', { status: response.status, response: data });
        return false;
      }

      logger.info('Daraja SMS sent', { phone: formattedPhone, requestId: data?.response?.requestId });
      return true;
    } catch (err) {
      logger.error('Daraja SMS error', { error: err.message });
      return false;
    }
  },
};

module.exports = darajaService;
