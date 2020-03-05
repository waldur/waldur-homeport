import '@waldur/openstack/provider';
import { Resource } from '@waldur/resource/types';

import { getResourceState } from './utils';

describe('getResourceState', () => {
  it('renders OK state', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'OK',
      runtime_state: 'ONLINE',
      service_settings_state: 'OK',
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'primary',
      label: 'ONLINE',
      active: false,
      tooltip: 'Resource is in sync, current state on backend: ONLINE.',
    });
  });

  it('renders error state', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'Erred',
      runtime_state: 'ONLINE',
      service_settings_state: 'OK',
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'warning',
      label: 'ONLINE',
      active: false,
      tooltip: 'Failed to operate with backend.',
    });
  });

  it('renders error runtime state', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'OK',
      runtime_state: 'ERROR',
      service_settings_state: 'OK',
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'danger',
      label: 'ERROR',
      active: false,
      tooltip: 'Resource is in sync, current state on backend: ERROR.',
    });
  });

  it('renders error for service settings state', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'OK',
      runtime_state: 'ONLINE',
      service_settings_state: 'ERRED',
      service_settings_error_message: 'Server does not respond.',
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'warning',
      label: 'ONLINE',
      active: false,
      tooltip:
        'Service settings of this resource are in state erred., error message: Server does not respond.',
    });
  });

  it('renders progress state', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'Updating',
      runtime_state: 'RESIZING',
      service_settings_state: 'OK',
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'primary',
      label: 'Updating',
      active: true,
      tooltip:
        'Updating OpenStack Instance, current state on backend: RESIZING.',
    });
  });

  it('renders action details', () => {
    const resource: Resource = {
      name: 'Instance',
      uuid: 'uuid',
      resource_type: 'OpenStackTenant.Instance',
      state: 'Updating',
      runtime_state: 'RESIZING',
      service_settings_state: 'OK',
      action: 'change_flavor',
      action_details: { message: 'Changing flavor from small to large.' },
    };
    expect(getResourceState(resource)).toEqual({
      variant: 'primary',
      label: 'Changing flavor',
      active: true,
      tooltip:
        'Changing flavor from small to large., current state on backend: RESIZING.',
    });
  });
});
