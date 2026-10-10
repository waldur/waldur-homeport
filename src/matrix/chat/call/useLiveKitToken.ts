import { useCallback, useEffect, useRef, useState } from 'react';

import { useMatrixClient } from '../useMatrixClient';

import {
  getCallDeviceId,
  LiveKitFocus,
  makeLiveKitFocus,
} from './callMembership';
import { LiveKitCredentials } from './types';

interface WellKnownFocus {
  type: string;
  livekit_service_url?: string;
  livekit_alias?: string;
}

// The MatrixRTC slot of a room's call, as matrix-js-sdk names it (application
// m.call, call id ROOM). The token service derives the LiveKit room from room id + slot,
// so every client must use this one to meet in the same LiveKit room.
const CALL_SLOT_ID = 'm.call#ROOM';

/**
 * A token service URL reduced to origin + path, trailing slashes stripped, so
 * two spellings of one service compare equal. Null for anything that is not
 * an absolute http(s) URL.
 */
function normaliseServiceUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url === '') return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

// Plain ws: to the SFU only where the page itself is not on TLS anyway.
function insecureSfuAllowed(): boolean {
  if (import.meta.env.DEV) return true;
  const { protocol, hostname } = window.location;
  return (
    protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
  );
}

/**
 * The LiveKit credentials of a token service response. Throws unless both
 * are strings and the SFU URL is wss: (or ws: where `allowInsecure`).
 */
export function readLiveKitCredentials(
  data: unknown,
  allowInsecure: boolean,
): LiveKitCredentials {
  const { url, jwt } = (data ?? {}) as Record<string, unknown>;
  if (typeof jwt !== 'string' || jwt === '') {
    throw new Error('Token service response has no LiveKit token');
  }
  if (typeof url !== 'string' || url === '') {
    throw new Error('Token service response has no LiveKit URL');
  }
  let protocol: string;
  try {
    protocol = new URL(url).protocol;
  } catch {
    throw new Error('Token service response has an invalid LiveKit URL');
  }
  if (protocol !== 'wss:' && !(protocol === 'ws:' && allowInsecure)) {
    throw new Error(
      `Token service response has a LiveKit URL with protocol ${protocol}; wss: is required`,
    );
  }
  return { url, jwt };
}

/** The participant identity a LiveKit access token grants, if readable. */
function liveKitTokenIdentity(jwt: string): string | undefined {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)),
      ),
    );
    return typeof claims.sub === 'string' ? claims.sub : undefined;
  } catch {
    return undefined;
  }
}

export const useLiveKitToken = () => {
  const { client } = useMatrixClient();
  const [rtcAvailable, setRtcAvailable] = useState(false);
  // The URL the browser sends token requests to.
  const livekitUrlRef = useRef<string | null>(null);
  // The URL as the homeserver advertises it: what memberships carry, so other
  // clients (Element Call) recognise the focus as the one they use.
  const advertisedUrlRef = useRef<string | null>(null);
  // Every token service this deployment runs, normalised, mapped to the URL
  // to send requests to. Only these are followed when another member's
  // membership names the call's focus: any room member can publish one, and
  // the request carries this user's OpenID token.
  const trustedServicesRef = useRef<Map<string, string>>(new Map());
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

      const lkFoci = Array.isArray(foci)
        ? foci.filter(
            (f) =>
              f?.type === 'livekit' &&
              typeof f.livekit_service_url === 'string' &&
              f.livekit_service_url !== '',
          )
        : [];
      const lkFocus = lkFoci[0];
      if (lkFocus?.livekit_service_url) {
        advertisedUrlRef.current = lkFocus.livekit_service_url.replace(
          /\/+$/,
          '',
        );
        // In dev, VITE_LK_JWT_URL may name the token service to call instead
        // of the advertised one, e.g. the API of another local stack.
        const devServiceUrl = import.meta.env.DEV
          ? normaliseServiceUrl(import.meta.env.VITE_LK_JWT_URL)
          : null;
        const serviceUrl = devServiceUrl || advertisedUrlRef.current;

        const trusted = new Map<string, string>();
        const trust = (url: unknown, requestUrl: string) => {
          const key = normaliseServiceUrl(url);
          if (key && !trusted.has(key)) trusted.set(key, requestUrl);
        };
        for (const focus of lkFoci) {
          const raw = focus.livekit_service_url as string;
          trust(raw, devServiceUrl || raw.replace(/\/+$/, ''));
        }
        if (devServiceUrl) trust(devServiceUrl, devServiceUrl);
        trustedServicesRef.current = trusted;

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

  /** The focus this device advertises in its call membership. */
  const getFocus = useCallback(
    async (roomId: string): Promise<LiveKitFocus | null> => {
      await discover();
      const url = advertisedUrlRef.current;
      return url ? makeLiveKitFocus(url, roomId) : null;
    },
    [discover],
  );

  const acquireToken = useCallback(
    async (
      roomId: string,
      activeFocus?: LiveKitFocus | null,
      { encrypted = false }: { encrypted?: boolean } = {},
    ): Promise<LiveKitCredentials | null> => {
      if (!client) return null;

      const controller = new AbortController();
      // Replace any prior in-flight token call. The hook's unmount effect
      // also aborts this — both paths converge on acquireAbortRef.
      acquireAbortRef.current?.abort();
      acquireAbortRef.current = controller;

      try {
        const ownServiceUrl = await discover();
        if (controller.signal.aborted) return null;
        // Follow the oldest member's focus only when it is one of our own
        // services; any other, ours. The LiveKit room is the same either way:
        // the token service derives it from the Matrix room, the focus alias.
        const activeKey = normaliseServiceUrl(activeFocus?.livekit_service_url);
        const serviceUrl =
          (activeKey && trustedServicesRef.current.get(activeKey)) ||
          ownServiceUrl;
        if (!serviceUrl) return null;

        // The Matrix device this tab's session runs on, the same one the
        // call.member state key names.
        const deviceId = getCallDeviceId(client);
        const userId = client.getUserId() || '';
        if (!deviceId) return null;

        const post = (path: string, body: object) =>
          fetch(`${serviceUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

        // The legacy endpoint, as Element Call does for state-event
        // memberships ("compatibility" mode): it puts every client in the
        // LiveKit room of slot m.call#ROOM, under the identity
        // `<user>:<device>` that Element Call looks participants up by.
        let res = await post('/sfu/get', {
          room: roomId,
          openid_token: await client.getOpenIdToken(),
          device_id: deviceId,
        });
        if (controller.signal.aborted) return null;
        // Media keys are bound to the `<user>:<device>` identity; the
        // MatrixRTC endpoint may issue another, so encrypted calls stay on
        // the legacy one.
        if (!encrypted && (res.status === 404 || res.status === 405)) {
          // A service without the legacy endpoint: the MatrixRTC request,
          // for the same slot, so the call still shares Element's room.
          res = await post('/get_token', {
            room_id: roomId,
            slot_id: CALL_SLOT_ID,
            openid_token: await client.getOpenIdToken(),
            member: {
              id: `${userId}:${deviceId}`,
              claimed_user_id: userId,
              claimed_device_id: deviceId,
            },
          });
          if (controller.signal.aborted) return null;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Token exchange failed: ${text}`);
        }

        const data = await res.json();
        if (controller.signal.aborted) return null;

        const credentials = readLiveKitCredentials(data, insecureSfuAllowed());
        if (
          encrypted &&
          liveKitTokenIdentity(credentials.jwt) !== `${userId}:${deviceId}`
        ) {
          throw new Error('The call token is for another identity');
        }

        // In dev, the response URL may contain Docker-internal hostnames
        // (e.g. ws://livekit:7880). Rewrite to localhost for the browser.
        if (import.meta.env.DEV) {
          credentials.url = credentials.url.replace(
            /^ws:\/\/livekit:/,
            'ws://localhost:',
          );
        }

        return credentials;
      } catch {
        return null;
      }
    },
    [client, discover],
  );

  return { rtcAvailable, discover, getFocus, acquireToken };
};
