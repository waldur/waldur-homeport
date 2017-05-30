import customerUtils from './utils';

describe('customerUtils', () => {

  let instance;
  let priceEstimatesService;
  let customer = {
    url: 'api/fake/customer/1',
    price_estimate: {
      limit: 11,
      threshold: 11,
      total: 10,
    }
  };
  beforeEach(inject(() => {
    priceEstimatesService = function($q) {
      return {
        isHardLimit: jasmine.createSpy('isHardLimit').and.returnValue(false),
        saveLimit: jasmine.createSpy('saveLimit').and.returnValue($q.when([])),
        saveThreshold: jasmine.createSpy('saveThreshold').and.returnValue($q.when([]))
      };
    };
    instance = new customerUtils(priceEstimatesService);
  }));

  it('isHardLimit returns true if price_estimate limit is larget than 0 and equals to the threshold', () => {
    expect(instance.isHardLimit(customer.price_estimate)).toBeTruthy();
  });

  it('isHardLimit returns false if price_estimate limit is less than or equals to 0', () => {
    customer.price_estimate.limit = 0;
    expect(instance.isHardLimit(customer)).toBeFalsy();
  });

  it('isHardLimit returns false if price_estimate limit is less than threshold', () => {
    customer.price_estimate.limit = customer.price_estimate.threshold - 1;
    expect(instance.isHardLimit(customer)).toBeFalsy();
  });
});
