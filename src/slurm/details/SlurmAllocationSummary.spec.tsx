import {
  getField,
  renderSummary,
  resource,
} from './SlurmAllocationSummary.fixture';

jest.mock('@waldur/core/Link', () => {
  return {
    Link: ({ label, children }) => <a>{label || children}</a>,
  };
});

describe('SlurmAllocationSummary', () => {
  it('renders quota usage', () => {
    const wrapper = renderSummary({ resource });
    expect(getField(wrapper, 'CPU')).toBe('2.00h of 40.00h');
    expect(getField(wrapper, 'GPU')).toBe('0.00h of ∞');
    expect(getField(wrapper, 'RAM')).toBe('170.6 MB-h of 20 GB-h');
  });

  it('renders login details', () => {
    const wrapper = renderSummary({ resource });
    expect(getField(wrapper, 'Login with')).toBe('ssh admin@example.com');
  });

  it('renders placeholder if login details are absent', () => {
    const wrapper = renderSummary({
      resource: { ...resource, username: undefined },
    });
    expect(getField(wrapper, 'Login with')).toBe(
      'FreeIPA account needs to be set up.',
    );
  });

  it('renders submit details for SLURM', () => {
    const wrapper = renderSummary({ resource });
    expect(getField(wrapper, 'Submit with')).toBe('sbatch -A VALID_ID');
  });

  it('renders documentation link', () => {
    const homepage = 'https://example.com/';
    const resource_data = { ...resource, homepage };
    const wrapper = renderSummary({ resource: resource_data });
    const link = wrapper.find({ label: 'Submit with' }).find('a').first();
    expect(link.prop('href')).toBe(homepage);
  });
});
