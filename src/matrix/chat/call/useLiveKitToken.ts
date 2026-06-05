import { useCallback, useEffect, useRef, useState } from 'react';

import { useMatrixClient } from '../useMatrixClient';

import { LiveKitCredentials } from './types';

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

function getOrCreateDeviceId(): string {
  let deviceId = sessionStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    sessionStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

interface WellKnownFocus {
  type: string;
  livekit_service_url?: string;
  livekit_alias?: string;
}

export const useLiveKitToken = () => {
  const { client } = useMatrixClient();
  const [rtcAvailable, setRtcAvailable] = useState(false);
  const livekitUrlRef = useRef<string | null>(null);
  const discoveredRef = useRef(false);
  // Separate abort controllers for the two flows. discover() runs once on
  // connect; acquireToken() runs per call attempt. Sharing one ref would
  // let an in-flight discover cancel an in-flight token exchange (or vice
  // versa), which is what broke the local call test.
  const discoverAbortRef = useRef<AbortController | null>(null);
  const acquireAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      discoverAbortRef.current?.abort();
      discoverAbortRef.current = null;
      acquireAbortRef.current?.abort();
      acquireAbortRef.current = null;
    };
  }, []);

  const discover = useCallback(async () => {
    if (discoveredRef.current) return livekitUrlRef.current;
    if (!client) return null;

    discoverAbortRef.current?.abort();
    const controller = new AbortController();
    discoverAbortRef.current = controller;

    try {
      const homeserverUrl = client.getHomeserverUrl();
      const res = await fetch(`${homeserverUrl}/.well-known/matrix/client`, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return null;
      if (!res.ok) {
        discoveredRef.current = true;
        setRtcAvailable(false);
        return null;
      }

      const data = await res.json();

      // Check both possible key names per MSC4143
      const foci: WellKnownFocus[] =
        data['org.matrix.msc4143.rtc_foci'] ||
        data['org.matrix.msc4143.rtc_transports'] ||
        [];

      const lkFocus = foci.find((f) => f.type === 'livekit');
      if (lkFocus?.livekit_service_url) {
        let serviceUrl = lkFocus.livekit_service_url;

        // In dev, rewrite to Vite proxy to avoid CORS
        if (import.meta.env.DEV && !serviceUrl.startsWith('/lk-jwt')) {
          serviceUrl = '/lk-jwt';
        }

        livekitUrlRef.current = serviceUrl;
        discoveredRef.current = true;
        setRtcAvailable(true);
        return serviceUrl;
      }

      discoveredRef.current = true;
      setRtcAvailable(false);
      return null;
    } catch {
      if (controller.signal.aborted) return null;
      discoveredRef.current = true;
      setRtcAvailable(false);
      return null;
    }
  }, [client]);

  const acquireToken = useCallback(
    async (roomId: string): Promise<LiveKitCredentials | null> => {
      if (!client) return null;

      const controller = new AbortController();
      // Replace any prior in-flight token call. The hook's unmount effect
      // also aborts this — both paths converge on acquireAbortRef.
      acquireAbortRef.current?.abort();
      acquireAbortRef.current = controller;

      try {
        const serviceUrl = await discover();
        if (!serviceUrl || controller.signal.aborted) {
          return null;
        }

        // Get Matrix OpenID token
        const openIdToken = await client.getOpenIdToken();
        if (controller.signal.aborted) return null;

        const deviceId = getOrCreateDeviceId();
        const userId = client.getUserId() || '';

        // Exchange for LiveKit JWT (SFURequest format)
        const res = await fetch(`${serviceUrl}/sfu/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: roomId,
            slot_id: '0',
            openid_token: openIdToken,
            member: {
              id: deviceId,
              claimed_user_id: userId,
              claimed_device_id: deviceId,
            },
          }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return null;

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Token exchange failed: ${text}`);
        }

        const data = await res.json();
        if (controller.signal.aborted) return null;

        // In dev, the response URL may contain Docker-internal hostnames
        // (e.g. ws://livekit:7880). Rewrite to localhost for the browser.
        let lkUrl: string = data.url;
        if (import.meta.env.DEV) {
          lkUrl = lkUrl.replace(/^ws:\/\/livekit:/, 'ws://localhost:');
        }

        return { url: lkUrl, jwt: data.jwt };
      } catch {
        return null;
      }
    },
    [client, discover],
  );

  return { rtcAvailable, discover, acquireToken };
};
