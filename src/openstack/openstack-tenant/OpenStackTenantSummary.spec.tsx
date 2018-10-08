import {
  hasUsername,
  hasPassword,
  hasAccess,
  hasExternalLink,
  getField,
  getPackage,
  renderSummary,
  resource,
} from './OpenStackTenantSummary.fixture';

describe('OpenStackTenantSummary', () => {
  it('renders package spec', () => {
    const wrapper = renderSummary({resource});
    expect(getPackage(wrapper)).toBe('Trial package / Small (10 vCPU, 10 GB RAM, 50 GB storage)');
  });

  it('renders credentials if they are not concealed', () => {
    const wrapper = renderSummary({resource, tenantCredentialsVisible: true});
    expect(hasUsername(wrapper)).toBe(true);
    expect(hasPassword(wrapper)).toBe(true);
    expect(hasAccess(wrapper)).toBe(true);
  });

  it('does not render credentials if they are concealed', () => {
    const wrapper = renderSummary({resource, tenantCredentialsVisible: false});
    expect(hasUsername(wrapper)).toBe(false);
    expect(hasPassword(wrapper)).toBe(false);
    expect(hasAccess(wrapper)).toBe(false);
  });

  it('renders external link if url is provided', () => {
    const wrapper = renderSummary({resource, tenantCredentialsVisible: true});
    expect(hasExternalLink(wrapper)).toBe(true);
  });

  it('render placeholder if url is not provided', () => {
    const wrapper = renderSummary({
      resource: {...resource, access_url: undefined},
      tenantCredentialsVisible: true,
    });
    expect(getField(wrapper, 'Access').text()).toBe('No access info.');
  });

  it('skips package rendering if template is not provided', () => {
    const wrapper = renderSummary({resource: {...resource, extra_configuration: {}}});
    expect(getField(wrapper, 'Package').length).toBe(0);
  });
});
