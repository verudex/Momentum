import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';

export function useAssetPreload(assets: number[]) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await Asset.loadAsync(assets);
      setReady(true);
    };
    load();
  }, []);

  return ready;
}