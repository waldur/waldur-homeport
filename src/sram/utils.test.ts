import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  getSramGrantKind,
  isSramGrant,
  isSramPlaceholderRoleName,
  isSramUiEnabled,
} from './utils';

const setSram = ({ flag, feature }: { flag?: boolean; feature?: boolean }) => {
  (ENV.plugins.WALDUR_CORE as any).SRAM_INTEGRATION_ENABLED = flag;
  (ENV as any).FEATURES = { sram: { integration: feature } };
};

afterEach(() => {
  delete (ENV.plugins.WALDUR_CORE as any).SRAM_INTEGRATION_ENABLED;
  (ENV as any).FEATURES = {};
});

describe('isSramUiEnabled', () => {
  it('needs both the Constance flag and the UI feature', () => {
    setSram({ flag: true, feature: true });
    expect(isSramUiEnabled()).toBe(true);
  });

  it('is off while the backend integration is off', () => {
    setSram({ flag: false, feature: true });
    expect(isSramUiEnabled()).toBe(false);
  });

  it('is off while the UI feature is off', () => {
    setSram({ flag: true, feature: false });
    expect(isSramUiEnabled()).toBe(false);
  });

  it('is off when the flag is missing from an older backend', () => {
    setSram({ feature: true });
    expect(isSramUiEnabled()).toBe(false);
  });
});

describe('getSramGrantKind', () => {
  it('recognises placeholder grants', () => {
    expect(getSramGrantKind('sram:9d863b8abfd54595a19c5ac86edacbc4')).toBe(
      'placeholder',
    );
  });

  it('recognises rule grants', () => {
    expect(getSramGrantKind('sram-rule:abc:def')).toBe('rule');
  });

  it('ignores every other source', () => {
    expect(getSramGrantKind('')).toBeNull();
    expect(getSramGrantKind(null)).toBeNull();
    expect(getSramGrantKind(undefined)).toBeNull();
    expect(getSramGrantKind('scim:default')).toBeNull();
    expect(getSramGrantKind('manual')).toBeNull();
    // A prefix match on "sram" alone would catch these.
    expect(getSramGrantKind('sramx:1')).toBeNull();
    expect(getSramGrantKind('sram-other:1')).toBeNull();
    expect(isSramGrant('sram-other:1')).toBe(false);
    expect(isSramGrant('sram-rule:1')).toBe(true);
  });
});

describe('isSramPlaceholderRoleName', () => {
  it('matches collaboration and group placeholders', () => {
    expect(isSramPlaceholderRoleName('CUSTOMER.ufra.SRAM.research')).toBe(true);
    expect(
      isSramPlaceholderRoleName('CUSTOMER.uuc.SRAM.ai_computing.mail-mail'),
    ).toBe(true);
  });

  it('leaves other roles alone', () => {
    expect(isSramPlaceholderRoleName('CUSTOMER.OWNER')).toBe(false);
    expect(isSramPlaceholderRoleName('PROJECT.ufra.SRAM.research')).toBe(false);
    expect(isSramPlaceholderRoleName('CUSTOMER.ufra.ADMIN')).toBe(false);
    expect(isSramPlaceholderRoleName('CUSTOMER.ufra.SRAM.')).toBe(false);
    expect(isSramPlaceholderRoleName(undefined)).toBe(false);
  });
});
