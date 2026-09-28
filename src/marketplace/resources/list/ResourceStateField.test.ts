import { describe, expect, it } from 'vitest';
import { Resource } from 'waldur-js-client';

import { getResourceStateVariant } from './ResourceStateField';

const resource = (runtime_state?: string, state = 'OK') =>
  ({ state, backend_metadata: { runtime_state } }) as unknown as Resource;

describe('getResourceStateVariant', () => {
  it('renders a stopped OpenStack instance as neutral', () => {
    expect(getResourceStateVariant(resource('SHUTOFF'))).toBe('neutral');
  });

  // VMware reports its own names for power states; POWERED_OFF used to fall
  // through to success and look the same as a running VM.
  it('renders a powered-off VMware VM as neutral', () => {
    expect(getResourceStateVariant(resource('POWERED_OFF'))).toBe('neutral');
  });

  it('renders a suspended VMware VM as neutral', () => {
    expect(getResourceStateVariant(resource('SUSPENDED'))).toBe('neutral');
  });

  it('renders a powered-on VMware VM as success', () => {
    expect(getResourceStateVariant(resource('POWERED_ON'))).toBe('success');
  });

  it('renders an erred resource as danger whatever its runtime state', () => {
    expect(getResourceStateVariant(resource('POWERED_OFF', 'Erred'))).toBe(
      'danger',
    );
  });

  it('renders a terminated resource as warning', () => {
    expect(getResourceStateVariant(resource(undefined, 'Terminated'))).toBe(
      'warning',
    );
  });
});
