import { translate } from '@/i18n';

import type { UploadedMedia } from '../types';

interface VoiceContentOpts {
  // The uploaded clip: a plain `url`, or an encrypted `file`.
  media: UploadedMedia;
  mimetype: string;
  size: number;
  durationMs: number;
  // Normalized 0..1 values from the recorder — MSC3245 expects integers 0..1024
  waveform: number[];
}

type VoiceMessageContent = UploadedMedia & {
  msgtype: 'm.audio';
  body: string;
  info: {
    mimetype: string;
    size: number;
    duration: number;
  };
  'org.matrix.msc3245.voice': Record<string, never>;
  'org.matrix.msc1767.audio': {
    duration: number;
    waveform: number[];
  };
};

export function buildVoiceContent(opts: VoiceContentOpts): VoiceMessageContent {
  const { media, mimetype, size, durationMs, waveform } = opts;

  const scaledWaveform = waveform.map((v) =>
    Math.min(1024, Math.max(0, Math.round(v * 1024))),
  );

  return {
    msgtype: 'm.audio',
    body: translate('Voice message'),
    ...media,
    info: {
      mimetype,
      size,
      duration: durationMs,
    },
    'org.matrix.msc3245.voice': {},
    'org.matrix.msc1767.audio': {
      duration: durationMs,
      waveform: scaledWaveform,
    },
  };
}
