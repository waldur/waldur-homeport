import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ServiceAccessMode } from '@/auth/types';
import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { OfferViaCallAction } from './OfferViaCallAction';

const offering = { uuid: 'offering-uuid', name: 'HPC', state: 'Active' } as any;

const render = ({
  user = { is_staff: true },
  mode = 'marketplace' as ServiceAccessMode,
} = {}) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user as any);
  ENV.plugins.WALDUR_CORE.SERVICE_ACCESS_MODE = mode;
  return renderWithProviders(
    <OfferViaCallAction row={offering} refetch={vi.fn()} />,
  );
};

const isVisible = () => screen.queryByText('Offer via call') !== null;

describe('OfferViaCallAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is offered to staff in marketplace-only mode', () => {
    render();
    expect(isVisible()).toBe(true);
  });

  // The action skips the call-setup screens and their permission checks, so
  // the staff gate is the only thing standing between a service provider and
  // a call they could not otherwise create.
  it('is hidden from non-staff users', () => {
    render({ user: { is_staff: false } });
    expect(isVisible()).toBe(false);
  });

  it('is hidden when there is no user', () => {
    render({ user: null });
    expect(isVisible()).toBe(false);
  });

  it('is hidden where calls are a section of their own', () => {
    render({ mode: 'both' });
    expect(isVisible()).toBe(false);
  });

  it('is hidden for an offering that cannot be requested yet', () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      is_staff: true,
    } as any);
    ENV.plugins.WALDUR_CORE.SERVICE_ACCESS_MODE = 'marketplace';
    renderWithProviders(
      <OfferViaCallAction
        row={{ ...offering, state: 'Draft' }}
        refetch={vi.fn()}
      />,
    );
    expect(isVisible()).toBe(false);
  });
});
