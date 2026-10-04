import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  canOpenInExternalClient,
  getMatrixExternalLoginMethod,
  getMatrixRoomUrl,
} from './utils';

describe('external Matrix client login', () => {
  it('matches the backend default when the deployment set no method', () => {
    ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = undefined;
    expect(getMatrixExternalLoginMethod()).toBe('none');
    expect(canOpenInExternalClient()).toBe(false);
  });

  it.each(['password', 'oidc'] as const)(
    'offers an external client for %s',
    (method) => {
      ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = method;
      expect(canOpenInExternalClient()).toBe(true);
    },
  );

  it('offers no external client for none', () => {
    ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = 'none';
    expect(canOpenInExternalClient()).toBe(false);
  });
});

describe('getMatrixRoomUrl', () => {
  it('addresses the room by its alias on matrix.to', () => {
    expect(getMatrixRoomUrl('#waldur-56c85843:matrix.example.com')).toBe(
      'https://matrix.to/#/%23waldur-56c85843%3Amatrix.example.com',
    );
  });

  it('accepts an alias that arrives without its leading sigil', () => {
    expect(getMatrixRoomUrl('waldur-56c85843:matrix.example.com')).toBe(
      'https://matrix.to/#/%23waldur-56c85843%3Amatrix.example.com',
    );
  });

  it('has no address for a room that has no alias yet', () => {
    expect(getMatrixRoomUrl('')).toBeNull();
    expect(getMatrixRoomUrl(undefined)).toBeNull();
  });
});
