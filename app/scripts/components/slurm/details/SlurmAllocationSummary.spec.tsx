import { getField, renderSummary, resource } from './SlurmAllocationSummary.fixture';

jest.mock('@waldur/core/services', () => ({
  $state: {href: () => 'validUrl'},
}));

describe('SlurmAllocationSummary', () => {
  it('renders quota usage', () => {
    const wrapper = renderSummary({resource});
    expect(getField(wrapper, 'CPU')).toBe('2.00 H of 40.00 H');
    expect(getField(wrapper, 'GPU')).toBe('0.00 H of ∞');
    expect(getField(wrapper, 'RAM')).toBe('10 GB of 20 GB');
  });

  it('renders login details', () => {
    const wrapper = renderSummary({resource});
    expect(getField(wrapper, 'Login details')).toBe('admin@example.com');
  });

  it('renders placeholder if login details are absent', () => {
    const wrapper = renderSummary({resource: {...resource, username: undefined}});
    expect(getField(wrapper, 'Login details')).toBe('FreeIPA account needs to be set up.');
  });

  it('renders submit details', () => {
    const wrapper = renderSummary({resource});
    expect(getField(wrapper, 'Submit with')).toBe('sbatch -A VALID_ID');
  });
});
