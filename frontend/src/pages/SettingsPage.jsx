import { useState } from 'react';
import { Save, Server, Database, Key, Bell, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    syncInterval: 300000,
    batchSize: 100,
    retryAttempts: 3,
    echisUrl: 'https://api.echis.kenya.go.ke/v1',
    openmrsUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4',
    notifications: true,
    autoSync: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

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
                onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) })}
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
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
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
                onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
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
