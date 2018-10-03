import quotasModule from './module';
import filtersModule from '../core/filters';

describe('Quotas', () => {
  quotasModule(angular.module('quotas', []));
  filtersModule(angular.module('core.filters', []));
  beforeEach(angular.mock.module('quotas'));
  beforeEach(angular.mock.module('core.filters'));

  describe('quotaNameFilter', () => {
    let quotaNameFilter;
    beforeEach(inject(_quotaNameFilter_ => {
      quotaNameFilter = _quotaNameFilter_;
    }));

    it('Displays snake_case strings replacing underscores with spaces, custom case #1', () => {
      expect(quotaNameFilter('floating_ip_count')).toBe('Floating IP count');
    });

    it('Displays snake_case strings replacing underscores with spaces, custom case #2', () => {
      expect(quotaNameFilter('vm_count')).toBe('Virtual machines count');
    });

    it('Displays snake_case strings replacing underscores with spaces, general case multiple words', () => {
      expect(quotaNameFilter('creepy_quota_value')).toBe('Creepy quota value');
    });
  });

  describe('quotaValueFilter', () => {
    let quotaValueFilter;
    beforeEach(inject(_quotaValueFilter_ => {
      quotaValueFilter = _quotaValueFilter_;
    }));

    it('displays ram value that is formatted with filesize filter', () => {
      expect(quotaValueFilter(10.0, 'ram')).toBe('10 MB');
    });

    it('displays storage value that is formatted with filesize filter', () => {
      expect(quotaValueFilter(100.0 * 1024, 'storage')).toBe('100 GB');
    });

    it('displays backup_storage value that is formatted with filesize filter', () => {
      expect(quotaValueFilter(1.99 * 1024 * 1024, 'backup_storage')).toBe('1.9 TB');
    });

    it('displays ∞ if value === -1', () => {
      expect(quotaValueFilter(-1, 'backup_storage')).toBe('∞');
    });

    it('displays initial value if quota name is not in filters list', () => {
      expect(quotaValueFilter(2000, 'custom_quota_name')).toBe(2000);
    });
  });
});
