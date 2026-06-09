const https = require('https');
const http = require('http');
const logger = require('../config/logger');

class ECHISAdapter {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl || process.env.ECHIS_API_URL;
    this.apiKey = apiKey || process.env.ECHIS_API_KEY;
  }

  _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'User-Agent': 'CHWS-Dashboard/1.0',
        },
        timeout: 30000,
      };

      if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(
          JSON.stringify(body)
        );
      }

      const transport = this.baseUrl.startsWith('https') ? https : http;

      const req = transport.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`eCHIS API error ${res.statusCode}: ${data}`));
            }
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('eCHIS API request timed out'));
      });

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async syncPatient(patient) {
    logger.info('Syncing patient to eCHIS', { patientId: patient.id });
    return this._request('POST', '/patients', patient);
  }

  async fetchPatient(echisId) {
    return this._request('GET', `/patients/${echisId}`);
  }

  async syncEncounter(encounter) {
    logger.info('Syncing encounter to eCHIS', { encounterId: encounter.id });
    return this._request('POST', '/encounters', encounter);
  }

  async syncHousehold(household) {
    logger.info('Syncing household to eCHIS', { householdId: household.id });
    return this._request('POST', '/households', household);
  }

  async fetchUpdatedPatients(since) {
    return this._request(
      'GET',
      `/patients?updated_since=${encodeURIComponent(since)}`
    );
  }

  async healthCheck() {
    try {
      await this._request('GET', '/health');
      return { status: 'connected', lastChecked: new Date().toISOString() };
    } catch (err) {
      return { status: 'disconnected', error: err.message, lastChecked: new Date().toISOString() };
    }
  }
}

module.exports = ECHISAdapter;
