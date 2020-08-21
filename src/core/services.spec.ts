import { formatCurrency } from './services';

describe('Currency filter', () => {
  it('displays two digits after comma by default', () => {
    expect(formatCurrency(100, '€', 2)).toBe('€100.00');
  });
});
