import { useState, useEffect } from 'react';
import { Save, Server, Loader2, RefreshCw, Bell, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    syncInterval: 300000,
    batchSize: 100,
    retryAttempts: 3,
    echisUrl: 'https://api.echis.kenya.go.ke/v1',
    openmrsUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4',
    notifications: true,
    autoSync: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings').then((r) => r.data);
        if (data.sync_settings) {
          setConfig((prev) => ({
            ...prev,
            syncInterval: data.sync_settings.interval_ms || prev.syncInterval,
            batchSize: data.sync_settings.batch_size || prev.batchSize,
            retryAttempts: data.sync_settings.retry_attempts || prev.retryAttempts,
          }));
        }
        if (data.echis_connection) {
          setConfig((prev) => ({
            ...prev,
            echisUrl: data.echis_connection.base_url || prev.echisUrl,
          }));
        }
        if (data.openmrs_connection) {
          setConfig((prev) => ({
            ...prev,
            openmrsUrl: data.openmrs_connection.base_url || prev.openmrsUrl,
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        sync_settings: {
          interval_ms: config.syncInterval,
          batch_size: config.batchSize,
          retry_attempts: config.retryAttempts,
          retry_delay_ms: 60000,
        },
        echis_connection: { base_url: config.echisUrl, status: 'disconnected', last_connected: null },
        openmrs_connection: { base_url: config.openmrsUrl, status: 'disconnected', last_connected: null },
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Configure system integration and preferences</p>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">Sync Configuration</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sync Interval (ms)
              </label>
              <input
                type="number"
                value={config.syncInterval}
                onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size
              </label>
              <input
                type="number"
                value={config.batchSize}
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retry Attempts
              </label>
              <input
                type="number"
                value={config.retryAttempts}
                onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Server className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">API Connections</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              eCHIS API URL
            </label>
            <input
              type="url"
              value={config.echisUrl}
              onChange={(e) => setConfig({ ...config, echisUrl: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenMRS FHIR URL
            </label>
            <input
              type="url"
              value={config.openmrsUrl}
              onChange={(e) => setConfig({ ...config, openmrsUrl: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">Preferences</h3>
        </div>
        <div className="card-body space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Enable automatic sync</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.notifications}
              onChange={(e) => setConfig({ ...config, notifications: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Enable sync failure notifications</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
