import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Resource } from 'waldur-js-client';

import {
  getResourceErrorReason,
  getResourceStateVariant,
  ResourceStateField,
} from './ResourceStateField';

const resource = (runtime_state?: string, state = 'OK') =>
  ({ state, backend_metadata: { runtime_state } }) as unknown as Resource;

const renderState = (resource: object) =>
  render(<ResourceStateField resource={resource as unknown as Resource} />);

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

  it('renders a VM or volume in error at the cloud as danger', () => {
    expect(getResourceStateVariant(resource('ERROR'))).toBe('danger');
    expect(getResourceStateVariant(resource('error'))).toBe('danger');
  });

  it('renders a volume whose extend or delete failed as danger', () => {
    expect(getResourceStateVariant(resource('error_extending'))).toBe('danger');
    expect(getResourceStateVariant(resource('error_deleting'))).toBe('danger');
  });

  it('renders a terminated resource as warning', () => {
    expect(getResourceStateVariant(resource(undefined, 'Terminated'))).toBe(
      'warning',
    );
  });
});

describe('getResourceErrorReason', () => {
  it('is null for a healthy resource', () => {
    expect(getResourceErrorReason(resource('ACTIVE'))).toBeNull();
  });

  it('quotes the state the cloud reports', () => {
    expect(getResourceErrorReason(resource('error_extending'))).toBe(
      'The provider reports this resource as Error extending.',
    );
  });

  it('blames the provider side when the backend object is erred', () => {
    expect(
      getResourceErrorReason({
        state: 'Erred',
        backend_metadata: { state: 'ERRED' },
      } as Resource),
    ).toBe('An operation on the provider side failed.');
  });

  it('blames the last operation when only the marketplace resource is erred', () => {
    expect(
      getResourceErrorReason({
        state: 'Erred',
        backend_metadata: { state: 'OK' },
      } as Resource),
    ).toBe('The last operation on this resource failed.');
  });
});

describe('ResourceStateField', () => {
  it('labels an erred resource as Erred even when the backend reports OK', () => {
    renderState({ state: 'Erred', backend_metadata: { state: 'OK' } });
    expect(screen.getByTestId('state-indicator')).toHaveTextContent('Erred');
    expect(screen.getByTestId('state-indicator')).not.toHaveTextContent('OK');
  });

  it('labels a VM in error at the cloud as Erred', () => {
    renderState({
      state: 'OK',
      backend_metadata: { state: 'OK', runtime_state: 'ERROR' },
    });
    expect(screen.getByTestId('state-indicator')).toHaveTextContent('Erred');
  });

  it('shows the runtime state when nothing is erred', () => {
    renderState({
      state: 'OK',
      backend_metadata: { state: 'OK', runtime_state: 'SHUTOFF' },
    });
    expect(screen.getByTestId('state-indicator')).toHaveTextContent('Shutoff');
  });

  it('shows the backend state when there is no runtime state', () => {
    renderState({ state: 'OK', backend_metadata: { state: 'OK' } });
    expect(screen.getByTestId('state-indicator')).toHaveTextContent('OK');
  });
});
