import { render, screen, waitFor } from '@testing-library/react';
import { Form } from 'react-final-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scienceDomainsList } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { ScienceDomainGroup } from './ScienceDomainGroup';

const renderGroup = (props = {}) =>
  render(
    <Form
      onSubmit={vi.fn()}
      render={() => <ScienceDomainGroup {...props} />}
    />,
  );

describe('ScienceDomainGroup', () => {
  const originalProjectFeatures = ENV.FEATURES.project;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(scienceDomainsList).mockResolvedValue({
      data: [{ uuid: 'domain-1', name: 'Natural sciences' }],
    } as any);
    ENV.FEATURES.project = {
      ...originalProjectFeatures,
      science_domain: false,
    };
  });

  afterEach(() => {
    ENV.FEATURES.project = originalProjectFeatures;
  });

  it('is hidden on a project form while the feature is off', () => {
    renderGroup();
    expect(screen.queryByText('Science domain')).not.toBeInTheDocument();
    expect(scienceDomainsList).not.toHaveBeenCalled();
  });

  it('is shown on a project form once the feature is on', async () => {
    ENV.FEATURES.project = { science_domain: true };
    renderGroup();
    expect(screen.getByText('Science domain')).toBeInTheDocument();
    await waitFor(() => expect(scienceDomainsList).toHaveBeenCalled());
  });

  // A failed load used to reject unhandled and leave the select loading.
  it('survives a failed load of the domains', async () => {
    vi.mocked(scienceDomainsList).mockRejectedValue(new Error('offline'));
    renderGroup({ alwaysShown: true });
    expect(screen.getByText('Science domain')).toBeInTheDocument();
    await waitFor(() => expect(scienceDomainsList).toHaveBeenCalled());
  });

  // The proposal form passes alwaysShown for a science domain its call
  // requires (see getFieldStates).
  it('is shown whatever the feature says when the caller asks for it', async () => {
    renderGroup({ alwaysShown: true, required: true });
    expect(screen.getByText('Science domain')).toBeInTheDocument();
    expect(screen.getByText('Science sub-domain')).toBeInTheDocument();
    await waitFor(() => expect(scienceDomainsList).toHaveBeenCalled());
  });
});
