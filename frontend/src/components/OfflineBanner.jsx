import { WifiOff, CloudUpload, RefreshCw, Loader2 } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export default function OfflineBanner() {
  const { isOnline, pendingCount, syncing, processQueue } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`sticky top-0 z-40 px-4 py-2 text-sm font-medium text-center ${
      isOnline ? 'bg-amber-50 text-amber-800 border-b border-amber-200' : 'bg-danger-50 text-danger-800 border-b border-danger-200'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <CloudUpload className="w-4 h-4" />
            <span>{pendingCount} change{pendingCount !== 1 ? 's' : ''} pending sync</span>
            <button
              onClick={processQueue}
              disabled={syncing}
              className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-medium disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Sync Now
            </button>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Data shown may be from a previous sync.</span>
            {pendingCount > 0 && (
              <span className="ml-1 font-bold">({pendingCount} pending change{pendingCount !== 1 ? 's' : ''})</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
