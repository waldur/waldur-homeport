import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  duplicatesOfAttached,
  fileDigest,
  screenNewFiles,
} from './documentDuplicates';

const pdf = (name: string, content: string, lastModified = 1) =>
  new File([content], name, { type: 'application/pdf', lastModified });

const sha256 = (content: string) =>
  createHash('sha256').update(content).digest('hex');

const attached = (fileName: string, content: string) => ({
  file_name: `proposal_project_supporting_documentation/${fileName}`,
  file_hash: sha256(content),
});

describe('fileDigest', () => {
  it("is the SHA-256 of the file's content, as the backend stores it", async () => {
    expect(await fileDigest(pdf('a.pdf', '%PDF-1'))).toBe(sha256('%PDF-1'));
  });
});

describe('screenNewFiles', () => {
  it('refuses a copy of an attached document, whatever its name', async () => {
    const { accepted, refused } = await screenNewFiles(
      [pdf('renamed.pdf', '%PDF-1')],
      [],
      [attached('report.pdf', '%PDF-1')],
    );

    expect(accepted).toEqual([]);
    expect(refused).toEqual([
      'renamed.pdf has the same content as report.pdf, which is already attached. To replace it, remove report.pdf first.',
    ]);
  });

  it('refuses a copy of a pending file under another name', async () => {
    const { accepted, refused } = await screenNewFiles(
      [pdf('copy.pdf', '%PDF-1')],
      [pdf('first.pdf', '%PDF-1')],
      [],
    );

    expect(accepted).toEqual([]);
    expect(refused).toEqual([
      'copy.pdf has the same content as first.pdf, which is already in the list.',
    ]);
  });

  it('lists a file chosen twice once', async () => {
    const file = pdf('a.pdf', '%PDF-1');

    const { accepted, refused } = await screenNewFiles([file], [file], []);

    expect(accepted).toEqual([]);
    expect(refused).toEqual(['a.pdf is already in the list.']);
  });

  it('refuses the second of two copies chosen together', async () => {
    const first = pdf('a.pdf', '%PDF-1');

    const { accepted, refused } = await screenNewFiles(
      [first, pdf('b.pdf', '%PDF-1')],
      [],
      [],
    );

    expect(accepted).toEqual([first]);
    expect(refused).toHaveLength(1);
  });

  it('accepts different content under the name of an attached document', async () => {
    const file = pdf('report.pdf', '%PDF-2');

    const { accepted, refused } = await screenNewFiles(
      [file],
      [],
      [attached('report.pdf', '%PDF-1')],
    );

    expect(accepted).toEqual([file]);
    expect(refused).toEqual([]);
  });

  it('accepts a file when the attached documents carry no hash', async () => {
    const file = pdf('a.pdf', '%PDF-1');

    const { accepted } = await screenNewFiles(
      [file],
      [],
      [{ file_name: 'a.pdf', file_hash: null }],
    );

    expect(accepted).toEqual([file]);
  });
});

describe('duplicatesOfAttached', () => {
  it('finds the refused files the proposal already holds', async () => {
    const uploaded = pdf('new.pdf', '%PDF-3');
    const copyOfUploaded = pdf('new-copy.pdf', '%PDF-3');
    const copyOfAttached = pdf('old-copy.pdf', '%PDF-1');
    const tooLarge = pdf('other.pdf', '%PDF-4');

    const duplicates = await duplicatesOfAttached(
      [copyOfUploaded, copyOfAttached, tooLarge],
      [uploaded],
      [attached('old.pdf', '%PDF-1')],
    );

    expect(duplicates).toEqual([copyOfUploaded, copyOfAttached]);
  });
});
