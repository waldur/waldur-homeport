import filtersModule from './filters';

describe('Core filters', () => {
  filtersModule(angular.module('core.filters', []));
  beforeEach(angular.mock.module('core.filters'));

  describe('filesizeFilter', () => {
    let filesizeFilter;
    beforeEach(inject(_filesizeFilter_ => {
      filesizeFilter = _filesizeFilter_;
    }));

    // https://opennode.atlassian.net/browse/WAL-378
    it('displays value in MB without any digits after comma if value < 1 GB', () => {
      expect(filesizeFilter(700)).toBe('700 MB');
    });

    it('displays value in GB without any digits after comma if value < 1 TB', () => {
      expect(filesizeFilter(900 * 1024)).toBe('900 GB');
    });

    it('displays value in TB with one digit after comma if value > 1 TB', () => {
      expect(filesizeFilter(1.2 * 1024 * 1024)).toBe('1.2 TB');
    });

    it('rounds value down to lower level', () => {
      expect(filesizeFilter(1.29 * 1024 * 1024)).toBe('1.2 TB');
    });
  });

  describe('defaultCurrency', () => {
    let defaultCurrencyFilter;

    beforeEach(angular.mock.module($provide => {
      $provide.constant('ENV', {currency: '€'});
    }));

    beforeEach(inject(_defaultCurrencyFilter_ => {
      defaultCurrencyFilter = _defaultCurrencyFilter_;
    }));

    it('displays two digits after comma by default', () => {
      expect(defaultCurrencyFilter(100)).toBe('€100.00');
    });

    it('displays three digits if value is small', () => {
      expect(defaultCurrencyFilter(0.003)).toBe('€0.003');
    });
  });
});
