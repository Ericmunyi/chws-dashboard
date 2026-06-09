const SYNC_DIRECTIONS = {
  PUSH_TO_ECHIS: 'push_to_echis',
  PULL_FROM_ECHIS: 'pull_from_echis',
  PUSH_TO_OPENMRS: 'push_to_openmrs',
  PULL_FROM_OPENMRS: 'pull_from_openmrs',
};

const SYNC_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  CONFLICT: 'conflict',
};

const SYNC_ENTITY_TYPES = {
  PATIENT: 'patient',
  ENCOUNTER: 'encounter',
  OBSERVATION: 'observation',
  IMMUNIZATION: 'immunization',
  HOUSEHOLD: 'household',
  CHW_ACTIVITY: 'chw_activity',
};

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CHW: 'chw',
  VIEWER: 'viewer',
};

const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  DATA_SYNC: 'data_sync',
  PATIENT_CREATE: 'patient_create',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_VIEW: 'patient_view',
  REPORT_GENERATE: 'report_generate',
  SYSTEM_CONFIG: 'system_config',
};

module.exports = {
  SYNC_DIRECTIONS,
  SYNC_STATUS,
  SYNC_ENTITY_TYPES,
  USER_ROLES,
  AUDIT_ACTIONS,
};
