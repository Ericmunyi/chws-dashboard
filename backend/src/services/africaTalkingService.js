const logger = require('../config/logger');

const AT_MESSAGING_URL = process.env.AT_ENVIRONMENT === 'production'
  ? 'https://api.africastalking.com/version1/messaging'
  : 'https://api.sandbox.africastalking.com/version1/messaging';

const SUCCESS_STATUSES = new Set(['Success', 'Sent', 'Queued']);

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('254')) return `+${digits}`;
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
  if (digits.length === 9 && /^[17]/.test(digits)) return `+254${digits}`;

  return `+${digits}`;
}

const africaTalkingService = {
  isConfigured() {
    return Boolean(process.env.AT_USERNAME && process.env.AT_API_KEY);
  },

  async sendSms(phone, message) {
    if (!this.isConfigured()) {
      logger.warn("Africa's Talking credentials not configured — OTP not sent via SMS");
      return false;
    }

    const to = normalizePhone(phone);
    if (!to) {
      logger.error("Africa's Talking SMS failed: invalid phone number", { phone });
      return false;
    }

    const payload = new URLSearchParams({
      username: process.env.AT_USERNAME,
      to,
      message,
    });

    if (process.env.AT_SENDER_ID) {
      payload.set('from', process.env.AT_SENDER_ID);
    }

    try {
      const response = await fetch(AT_MESSAGING_URL, {
        method: 'POST',
        headers: {
          apiKey: process.env.AT_API_KEY,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        logger.error("Africa's Talking SMS failed", {
          status: response.status,
          response: data,
        });
        return false;
      }

      const recipients = data?.SMSMessageData?.Recipients || [];
      const delivered = recipients.some((recipient) => SUCCESS_STATUSES.has(recipient.status));

      if (!delivered) {
        logger.error("Africa's Talking SMS not delivered", {
          phone: to,
          recipients,
        });
        return false;
      }

      logger.info("Africa's Talking SMS sent", {
        phone: to,
        messageId: recipients.find((recipient) => SUCCESS_STATUSES.has(recipient.status))?.messageId,
      });
      return true;
    } catch (err) {
      logger.error("Africa's Talking SMS error", { error: err.message });
      return false;
    }
  },
};

module.exports = africaTalkingService;
