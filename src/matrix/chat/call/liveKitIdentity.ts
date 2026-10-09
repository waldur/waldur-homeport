async function sha256UnpaddedBase64(raw: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw),
  );
  const padded = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return padded.replace(/=+$/, '');
}

// Every LiveKit identity a device may join under, so its tile gets a name:
// - `<user>:<device>`: lk-jwt's legacy /sfu/get, which this chat and Element
//   Call (state-event memberships) use;
// - lk-jwt's /get_token hash, sha256(JSON [user, device, member id]), for the
//   member ids a state-event membership uses: `<user>:<device>` (Element
//   Call) or the bare device id (earlier versions of this chat);
// - matrix-js-sdk's sticky-event hash, sha256(`user|device|member id`).
export async function computeLiveKitIdentities(
  userId: string,
  deviceId: string,
): Promise<string[]> {
  if (!userId || !deviceId) return [];
  const legacy = `${userId}:${deviceId}`;
  return [
    legacy,
    ...(await Promise.all([
      sha256UnpaddedBase64(JSON.stringify([userId, deviceId, legacy])),
      sha256UnpaddedBase64(JSON.stringify([userId, deviceId, deviceId])),
      sha256UnpaddedBase64(`${userId}|${deviceId}|${legacy}`),
    ])),
  ];
}
