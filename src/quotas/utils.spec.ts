import { formatQuotaName, formatQuotaType, formatQuotaValue } from './utils';

describe('formatQuotaName', () => {
  it('should return matching quota name from QUOTA_NAMES constant.', () => {
    const expected = 'Floating IP count';
    expect(formatQuotaName('floating_ip_count')).toEqual(expected);
  });

  it('should return properly formatted quota name if absent in QUOTA_NAMES constant.', () => {
    const expected = 'Security groups';
    expect(formatQuotaName('security_groups')).toEqual(expected);
  });
});

describe('formatQuotaType', () => {
  it('should return matching quota type from QUOTA_TYPES constant.', () => {
    const expected = 'Package amount';
    expect(formatQuotaType('QUOTA_PACKAGE_TYPE')).toEqual(expected);
  });

  it('should return properly formatted quota type if absent in QUOTA_TYPES constant.', () => {
    const expected = 'Quota instance type';
    expect(formatQuotaType('quota instance type')).toEqual(expected);
  });
});

describe('formatQuotaValue', () => {
  it('should return ∞ if available quota is -1.', () => {
    const expected = '∞';
    const availableQuota = -1;
    expect(formatQuotaValue(availableQuota, 'vcpu')).toEqual(expected);
  });

  it('should return properly formatted quota value if matching filter is found.', () => {
    const expected = '1.9 GB';
    const availableQuota = 4000 - 2000;
    expect(formatQuotaValue(availableQuota, 'ram')).toEqual(expected);
  });

  it('should quota value as is if matching filter is not found.', () => {
    const expected = 2000;
    const availableQuota = 4000 - 2000;
    expect(formatQuotaValue(availableQuota, 'instance')).toEqual(expected);
  });
});
