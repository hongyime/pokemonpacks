import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { universalStorage } from '@/lib/storageManager';

/** Report volatile changes immediately, without polling or discarding saved cards. */
export const StorageCompatibilityCheck = () => {
  const [temporary, setTemporary] = useState(() => universalStorage.getStorageType() === 'memory');
  const [lowSpace, setLowSpace] = useState(false);

  useEffect(() => {
    let active = true;
    const update = () => setTemporary(universalStorage.getStorageType() === 'memory');
    const unsubscribe = universalStorage.subscribe(update);
    update();
    void universalStorage.estimateSpace().then(estimate => {
      if (active && estimate) setLowSpace(estimate.usage / estimate.quota > 0.8);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  if (!temporary && !lowSpace) return null;

  return (
    <div className="shrink-0 px-4 py-2">
      <Alert role="status" aria-live="polite" className="mx-auto max-w-4xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{temporary ? 'Changes are temporary' : 'Storage is running low'}</AlertTitle>
        <AlertDescription>
          {temporary
            ? 'Your saved records are kept. New changes are available in this tab but may be lost when you reload. Export your favorites before leaving.'
            : 'Browser storage space is running low. Export your favorites to keep a copy before clearing any storage.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};
