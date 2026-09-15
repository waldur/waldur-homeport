import { describe, expect, it } from 'vitest';

import { getActiveAffiliateConflict, validateAffiliateLinkForm } from './utils';

const acme = { uuid: 'acme', name: 'Acme', url: 'https://example.com/acme/' };
const reseller = {
  uuid: 'reseller',
  name: 'ResellerCo',
  url: 'https://example.com/reseller/',
};
const activeAffiliates = new Map([['acme', 'OldReseller']]);

describe('getActiveAffiliateConflict', () => {
  it('returns the current affiliate for an active link', () => {
    expect(getActiveAffiliateConflict('acme', true, activeAffiliates)).toBe(
      'OldReseller',
    );
  });

  it('treats an unset Active flag as active, like the backend', () => {
    expect(
      getActiveAffiliateConflict('acme', undefined, activeAffiliates),
    ).toBe('OldReseller');
  });

  it('never reports a conflict for an inactive link', () => {
    expect(
      getActiveAffiliateConflict('acme', false, activeAffiliates),
    ).toBeUndefined();
  });

  it('reports nothing before the links are loaded', () => {
    expect(getActiveAffiliateConflict('acme', true, undefined)).toBeUndefined();
  });

  it('reports nothing for an organization without an affiliate', () => {
    expect(
      getActiveAffiliateConflict('reseller', true, activeAffiliates),
    ).toBeUndefined();
  });
});

describe('validateAffiliateLinkForm', () => {
  it('rejects an organization as its own affiliate', () => {
    const errors = validateAffiliateLinkForm({
      customer: reseller,
      affiliate: reseller,
    });
    expect(errors.affiliate).toBeDefined();
  });

  it('rejects an active link for an organization that already has one', () => {
    const errors = validateAffiliateLinkForm(
      { customer: acme, affiliate: reseller, is_active: true },
      activeAffiliates,
    );
    expect(errors.customer).toContain('OldReseller');
  });

  it('accepts an inactive link for an organization that already has one', () => {
    const errors = validateAffiliateLinkForm(
      { customer: acme, affiliate: reseller, is_active: false },
      activeAffiliates,
    );
    expect(errors).toEqual({});
  });

  it('rejects an end date on or before the start date', () => {
    const errors = validateAffiliateLinkForm({
      start_date: '2026-03-01',
      end_date: '2026-03-01',
    });
    expect(errors.end_date).toBeDefined();
  });

  it('skips the organization checks when editing an existing link', () => {
    const errors = validateAffiliateLinkForm(
      { customer_name: 'Acme', affiliate_name: 'OldReseller', is_active: true },
      activeAffiliates,
    );
    expect(errors).toEqual({});
  });
});
