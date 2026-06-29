import { useState } from 'react';
import { Smartphone, KeyRound, Loader2, AlertCircle, CheckCircle, LogOut, ArrowLeft, Activity, User, Phone, MapPin, Calendar, Stethoscope, Ambulance } from 'lucide-react';

const API = '/api/patient-portal';

export default function PatientPortalPage() {
  const [step, setStep] = useState('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(localStorage.getItem('patientToken'));
  const [patient, setPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPatientData = async (authToken) => {
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Session expired');
      const data = await res.json();
      setPatientData(data);
      setStep('dashboard');
    } catch {
      localStorage.removeItem('patientToken');
      setToken(null);
      setStep('login');
    }
  };

  if (token && !patientData) {
    fetchPatientData(token);
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.exists) {
        setError(data.message);
      } else {
        setMessage('OTP sent to your phone. (In dev mode, check the backend console/terminal.)');
        setStep('otp');
      }
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid OTP');
        return;
      }
      localStorage.setItem('patientToken', data.token);
      setToken(data.token);
      setPatient(data.patient);
      fetchPatientData(data.token);
    } catch {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    setToken(null);
    setPatient(null);
    setPatientData(null);
    setPhone('');
    setOtp('');
    setStep('login');
  };

  if (step === 'dashboard' && patientData) {
    const p = patientData;
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-800">Patient Portal</h1>
                <p className="text-sm text-blue-500">Welcome, {p.first_name} {p.last_name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-primary-700 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{p.phone || p.alt_phone || '\u2014'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium">{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : '\u2014'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium">{p.village || '\u2014'}{p.ward ? `, ${p.ward}` : ''}</p>
                </div>
              </div>
              {p.assigned_chw_name && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned CHW</p>
                    <p className="text-sm font-medium">{p.assigned_chw_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium capitalize">{p.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-primary-700 mb-4">Recent Encounters</h2>
            {(!p.encounters || p.encounters.length === 0) ? (
              <p className="text-gray-500 text-sm">No encounters recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Type</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Location</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">CHW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.encounters.map((enc) => (
                      <tr key={enc.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{new Date(enc.encounter_datetime).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Stethoscope className="w-3 h-3" />
                            {enc.encounter_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{enc.location || '\u2014'}</td>
                        <td className="px-4 py-2 text-gray-600">{enc.chw_name || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-primary-700 mb-4">Referrals</h2>
            {(!p.referrals || p.referrals.length === 0) ? (
              <p className="text-gray-500 text-sm">No referrals.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Referred To</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Reason</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">CHW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.referrals.map((ref) => (
                      <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{new Date(ref.encounter_datetime).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-gray-600">{ref.observations ? JSON.parse(ref.observations)?.referred_to || '\u2014' : '\u2014'}</td>
                        <td className="px-4 py-2 text-gray-600">{ref.observations ? JSON.parse(ref.observations)?.reason || '\u2014' : '\u2014'}</td>
                        <td className="px-4 py-2 text-gray-600">{ref.chw_name || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Patient Portal</h1>
          <p className="text-blue-100 mt-1">Access your health records securely</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {message}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="e.g. 0712345678"
                  required
                />
              </div>
              <button type="submit" disabled={loading || !phone} className="btn-primary w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">6-digit code sent to {phone}</p>
              </div>
              <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                Use a different number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-blue-200 mt-6">
          Your data is encrypted and securely transmitted.
        </p>
      </div>
    </div>
  );
}
