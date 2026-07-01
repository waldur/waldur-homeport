import { describe, expect, it } from 'vitest';

import { classifyPreviewEvent } from './previewClassifier';

describe('classifyPreviewEvent', () => {
  it('classifies a plain text message', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.text',
      body: 'Hello there',
    });
    expect(result).toMatchObject({ kind: 'text', text: 'Hello there' });
    expect(result.fileName).toBeUndefined();
    expect(result.fileSize).toBeUndefined();
  });

  it('prefers flattened formatted_body over raw markdown body', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.text',
      body: '**bold**',
      format: 'org.matrix.custom.html',
      formatted_body: '<strong>bold</strong>',
    });
    expect(result).toMatchObject({ kind: 'text', text: 'bold' });
  });

  it('classifies an image with filename and size', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.image',
      body: 'photo.png',
      info: { size: 1024 },
    });
    expect(result).toMatchObject({
      kind: 'image',
      fileName: 'photo.png',
      fileSize: 1024,
    });
  });

  it('classifies a file with filename and size', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.file',
      body: 'Tech requirements.pdf',
      info: { size: 737280 },
    });
    expect(result).toMatchObject({
      kind: 'file',
      fileName: 'Tech requirements.pdf',
      fileSize: 737280,
    });
  });

  it('classifies a video', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.video',
      body: 'Prototype draft 03.mp4',
      info: { size: 6_920_601 },
    });
    expect(result).toMatchObject({
      kind: 'video',
      fileName: 'Prototype draft 03.mp4',
      fileSize: 6_920_601,
    });
  });

  it('classifies an MSC3245 voice note as voice, not audio', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.audio',
      body: 'voice-message.ogg',
      'org.matrix.msc3245.voice': {},
      info: { size: 4096 },
    });
    expect(result.kind).toBe('voice');
  });

  it('classifies a plain audio clip as audio', () => {
    const result = classifyPreviewEvent('m.room.message', {
      msgtype: 'm.audio',
      body: 'song.mp3',
      info: { size: 4096 },
    });
    expect(result.kind).toBe('audio');
  });

  it('classifies a membership invite as a system event', () => {
    const result = classifyPreviewEvent(
      'm.room.member',
      { membership: 'invite', displayname: 'Alisa Hester' },
      { prevMembership: undefined, targetName: 'Alisa Hester' },
    );
    expect(result).toMatchObject({ kind: 'system' });
    expect(result.text).toContain('Alisa Hester');
  });

  it('returns a non-renderable result for unsupported event types', () => {
    const result = classifyPreviewEvent('m.room.topic', { topic: 'x' });
    expect(result.kind).toBe('none');
  });
});
