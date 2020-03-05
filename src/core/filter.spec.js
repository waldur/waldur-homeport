import filtersModule from './filters';

describe('Core filters', () => {
  filtersModule(angular.module('core.filters', []));
  beforeEach(angular.mock.module('core.filters'));

  describe('defaultCurrency', () => {
    let defaultCurrencyFilter;

    beforeEach(
      angular.mock.module($provide => {
        $provide.constant('ENV', { currency: '€' });
      }),
    );

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
