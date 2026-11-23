import { describe, expect, it } from 'vitest';

import { getArrowLicense } from './arrowLicense';

const resource = (backend_id: string, attributes?: object) =>
  ({ backend_id, attributes }) as any;

describe('getArrowLicense', () => {
  it('reads the license attribute, not the vendor subscription', () => {
    expect(
      getArrowLicense(resource('sub-1', { arrow_license_reference: 'XSP1' })),
    ).toBe('XSP1');
  });

  it('treats an empty attribute as no license', () => {
    expect(
      getArrowLicense(resource('XSP1', { arrow_license_reference: '' })),
    ).toBeUndefined();
  });

  it('falls back to a legacy license in backend_id, in any case', () => {
    expect(getArrowLicense(resource('xsp100201', {}))).toBe('xsp100201');
    expect(getArrowLicense(resource('11111111-aaaa', {}))).toBeUndefined();
  });
});
