/**
 * Whether this browser can encrypt call media end to end, as livekit-client's
 * isE2EESupported decides it: insertable streams (Chromium) or
 * RTCRtpScriptTransform (Firefox, Safari). Checked here so that deciding to
 * join does not load LiveKit.
 */
export function canEncryptCallMedia(): boolean {
  if (typeof window === 'undefined') return false;
  const sender = (window as any).RTCRtpSender;
  return (
    typeof (window as any).RTCRtpScriptTransform !== 'undefined' ||
    (typeof sender !== 'undefined' &&
      typeof sender.prototype.createEncodedStreams !== 'undefined')
  );
}
