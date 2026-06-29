const { db } = require('../models');
const ECHISAdapter = require('../adapters/echisAdapter');
const OpenMRSAdapter = require('../adapters/openmrsAdapter');
const logger = require('../config/logger');

const syncService = {
  _echis: null,
  _openmrs: null,
  _running: false,

  getEchis() {
    if (!this._echis) this._echis = new ECHISAdapter();
    return this._echis;
  },

  getOpenmrs() {
    if (!this._openmrs) this._openmrs = new OpenMRSAdapter();
    return this._openmrs;
  },

  async processSyncQueue() {
    if (this._running) {
      logger.warn('Sync already in progress, skipping');
      return { skipped: true };
    }
    this._running = true;
    const results = { processed: 0, failed: 0, errors: [] };
    try {
      const pending = await db.syncLog()
        .where({ status: 'pending' })
        .where('attempt_count', '<', 3)
        .orderBy('created_at', 'asc')
        .limit(100);

      if (pending.length === 0) return { processed: 0 };

      for (const item of pending) {
        try {
          await db.syncLog().where({ id: item.id }).update({
            status: 'in_progress',
            attempt_count: item.attempt_count + 1,
            last_attempt_at: new Date(),
          });

          if (item.direction === 'push_to_echis') await this.syncToECHIS(item);
          else if (item.direction === 'pull_from_echis') await this.syncFromECHIS(item);
          else if (item.direction === 'push_to_openmrs') await this.syncToOpenMRS(item);
          else if (item.direction === 'pull_from_openmrs') await this.syncFromOpenMRS(item);

          await db.syncLog().where({ id: item.id }).update({ status: 'success', completed_at: new Date() });
          results.processed++;
        } catch (err) {
          logger.error('Sync item failed', { itemId: item.id, error: err.message });
          await db.syncLog().where({ id: item.id }).update({ status: 'failed', error_message: err.message, response_payload: JSON.stringify({ error: err.message }) });
          results.failed++;
          results.errors.push({ itemId: item.id, error: err.message });
        }
      }
    } finally {
      this._running = false;
    }
    return results;
  },

  async syncToECHIS(item) {
    const { entity_type, entity_id } = item;
    const adapter = this.getEchis();
    if (entity_type === 'patient') {
      const patient = await db.patients().where({ id: entity_id }).first();
      if (patient) await adapter.syncPatient(patient);
    } else if (entity_type === 'encounter') {
      const encounter = await db.encounters().where({ id: entity_id }).first();
      if (encounter) await adapter.syncEncounter(encounter);
    } else if (entity_type === 'household') {
      const household = await db.households().where({ id: entity_id }).first();
      if (household) await adapter.syncHousehold(household);
    }
  },

  async syncFromECHIS() {
    const adapter = this.getEchis();
    const data = await adapter.fetchUpdatedPatients(new Date(Date.now() - 86400000).toISOString());
    logger.info('Fetched updates from eCHIS', { count: data?.length || 0 });
  },

  async syncToOpenMRS(item) {
    const { entity_type, entity_id } = item;
    const adapter = this.getOpenmrs();
    if (entity_type === 'patient') {
      const patient = await db.patients().where({ id: entity_id }).first();
      if (patient) {
        const fhirPatient = this._toFHIRPatient(patient);
        if (patient.openmrs_uuid) {
          await adapter.updatePatient(patient.openmrs_uuid, fhirPatient);
        } else {
          const created = await adapter.createPatient(fhirPatient);
          if (created?.id) {
            await db.patients().where({ id: patient.id }).update({ openmrs_uuid: created.id, last_synced_at: new Date() });
          }
        }
      }
    } else if (entity_type === 'encounter') {
      const encounter = await db.encounters().where({ id: entity_id }).first();
      if (encounter && !encounter.openmrs_encounter_uuid) {
        const fhirEncounter = this._toFHIREncounter(encounter);
        const created = await adapter.createEncounter(fhirEncounter);
        if (created?.id) {
          await db.encounters().where({ id: encounter.id }).update({ openmrs_encounter_uuid: created.id, sync_status: 'synced', last_synced_at: new Date() });
        }
      }
    }
  },

  async syncFromOpenMRS() {
    const adapter = this.getOpenmrs();
    const patients = await adapter.searchPatients({ _lastUpdated: 'gt' + new Date(Date.now() - 86400000).toISOString(), _count: 100 });
    logger.info('Fetched updates from OpenMRS', { count: patients?.entry?.length || 0 });
  },

  async queueEntity(entityType, entityId, direction) {
    const { v4: uuidv4 } = require('uuid');
    await db.syncLog().insert({ id: uuidv4(), entity_type: entityType, entity_id: entityId, direction, status: 'pending', attempt_count: 0 });
    logger.info(`Queued ${entityType} ${entityId} for ${direction}`);
  },

  async getSyncTimeline(limit = 50) {
    return db.syncLog()
      .select(
        'sync_log.*',
        db.knex.raw("CASE WHEN sync_log.entity_type = 'patient' THEN (patients.first_name || ' ' || patients.last_name) ELSE NULL END as entity_name")
      )
      .leftJoin('patients', function () {
        this.on('sync_log.entity_id', '=', 'patients.id').on('sync_log.entity_type', '=', db.knex.raw("'patient'"));
      })
      .orderBy('sync_log.created_at', 'desc')
      .limit(limit);
  },

  async retryFailedItems() {
    const items = await db.syncLog()
      .where({ status: 'failed' })
      .where('attempt_count', '<', 5)
      .select('*');

    if (items.length > 0) {
      const ids = items.map((i) => i.id);
      await db.syncLog().whereIn('id', ids).update({ status: 'pending' });
    }

    logger.info(`Retrying ${items.length} failed sync items`);
    return items;
  },

  _toFHIRPatient(patient) {
    return {
      resourceType: 'Patient',
      identifier: [
        { system: 'http://echis.kenya.go.ke/id', value: patient.echis_id },
        { system: 'http://openmrs.org/id', value: patient.openmrs_uuid },
        { system: 'urn:oid:2.16.840.1.113883.3.51.1.1.6', value: patient.national_id },
      ],
      name: [{ use: 'official', family: patient.last_name, given: [patient.first_name], ...(patient.middle_name && { middle: [patient.middle_name] }) }],
      gender: patient.gender?.toLowerCase(),
      birthDate: patient.date_of_birth,
      telecom: [...(patient.phone ? [{ system: 'phone', value: patient.phone, use: 'mobile' }] : [])],
      address: [{ text: patient.address, city: patient.ward, district: patient.sub_county, state: patient.county }],
      managingOrganization: { reference: `Location/${patient.assigned_chw_id}` },
    };
  },

  _toFHIREncounter(encounter) {
    return {
      resourceType: 'Encounter',
      status: 'finished',
      class: { code: 'HH', display: 'home health', system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode' },
      type: [{ coding: [{ code: encounter.encounter_type, display: encounter.encounter_type.replace(/_/g, ' ') }] }],
      subject: { reference: `Patient/${encounter.patient_id}` },
      participant: [{ individual: { reference: `Practitioner/${encounter.chw_id}` } }],
      period: { start: encounter.encounter_datetime, end: encounter.encounter_datetime },
      location: [{ location: { display: encounter.location }, position: { longitude: encounter.longitude, latitude: encounter.latitude } }],
    };
  },
};

module.exports = syncService;
