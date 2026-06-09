const https = require('https');
const http = require('http');
const logger = require('../config/logger');

class OpenMRSAdapter {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl || process.env.OPENMRS_BASE_URL;
    this.auth =
      'Basic ' +
      Buffer.from(
        `${username || process.env.OPENMRS_USERNAME}:${password || process.env.OPENMRS_PASSWORD}`
      ).toString('base64');
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
          'Content-Type': 'application/fhir+json',
          Authorization: this.auth,
          'User-Agent': 'CHWS-Dashboard/1.0',
          Accept: 'application/fhir+json',
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
              reject(
                new Error(`OpenMRS API error ${res.statusCode}: ${data}`)
              );
            }
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('OpenMRS API request timed out'));
      });

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async createPatient(fhirPatient) {
    logger.info('Creating patient in OpenMRS via FHIR');
    return this._request('POST', '/Patient', fhirPatient);
  }

  async updatePatient(fhirPatientId, fhirPatient) {
    logger.info('Updating patient in OpenMRS', { fhirPatientId });
    return this._request('PUT', `/Patient/${fhirPatientId}`, fhirPatient);
  }

  async getPatient(fhirPatientId) {
    return this._request('GET', `/Patient/${fhirPatientId}`);
  }

  async searchPatients(query) {
    return this._request(
      'GET',
      `/Patient?${new URLSearchParams(query).toString()}`
    );
  }

  async createEncounter(fhirEncounter) {
    logger.info('Creating encounter in OpenMRS via FHIR');
    return this._request('POST', '/Encounter', fhirEncounter);
  }

  async getObservations(patientId, category) {
    const params = { patient: patientId, _count: 100 };
    if (category) params.category = category;
    return this._request(
      'GET',
      `/Observation?${new URLSearchParams(params).toString()}`
    );
  }

  async healthCheck() {
    try {
      await this._request('GET', '/metadata');
      return { status: 'connected', lastChecked: new Date().toISOString() };
    } catch (err) {
      return {
        status: 'disconnected',
        error: err.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}

module.exports = OpenMRSAdapter;
