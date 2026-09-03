import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { DestroyAction } from './DestroyAction';

const renderAction = (resource: Record<string, unknown>) =>
  renderWithProviders(
    <DestroyAction resource={resource as any} refetch={vi.fn()} />,
  );

describe('DestroyAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('allows destroying an active instance', () => {
    renderAction({
      uuid: 'instance-uuid',
      name: 'web-1',
      state: 'OK',
      runtime_state: 'ACTIVE',
      marketplace_resource_uuid: 'marketplace-uuid',
    });

    expect(screen.getByText('Destroy')).toBeInTheDocument();
    expect(screen.getByTestId('action-item-content')).not.toHaveClass(
      'opacity-50',
    );
    expect(screen.queryByTestId('QuestionIcon')).toBeNull();
  });

  it('allows destroying a shutoff instance', () => {
    renderAction({
      uuid: 'instance-uuid',
      name: 'web-1',
      state: 'OK',
      runtime_state: 'SHUTOFF',
      marketplace_resource_uuid: 'marketplace-uuid',
    });

    expect(screen.getByTestId('action-item-content')).not.toHaveClass(
      'opacity-50',
    );
  });

  it('allows destroying an erred instance', () => {
    renderAction({
      uuid: 'instance-uuid',
      name: 'web-1',
      state: 'ERRED',
      runtime_state: 'ACTIVE',
      marketplace_resource_uuid: 'marketplace-uuid',
    });

    expect(screen.getByTestId('action-item-content')).not.toHaveClass(
      'opacity-50',
    );
  });

  it('disables destroy while the instance is updating', () => {
    renderAction({
      uuid: 'instance-uuid',
      name: 'web-1',
      state: 'UPDATING',
      runtime_state: 'ACTIVE',
      marketplace_resource_uuid: 'marketplace-uuid',
    });

    expect(screen.getByTestId('action-item-content')).toHaveClass('opacity-50');
    expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
  });

  it('hides destroy when the instance is not linked to a marketplace resource', () => {
    renderAction({
      uuid: 'instance-uuid',
      name: 'web-1',
      state: 'OK',
      runtime_state: 'ACTIVE',
    });

    expect(screen.queryByText('Destroy')).toBeNull();
  });
});
