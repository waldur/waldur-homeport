import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { VersionHistory } from 'waldur-js-client';

import { VersionHistoryItem } from './VersionHistoryItem';

describe('VersionHistoryItem', () => {
  const baseVersion: VersionHistory = {
    id: 1,
    revision_date: '2026-10-14T12:00:00Z',
    revision_user: { full_name: 'Alice Andersen', username: 'alice' },
    revision_comment: 'Initial revision',
    serialized_data: {},
  };

  it('renders author, initials and version indicator', () => {
    render(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={false}
        onSelect={vi.fn()}
        versionIndex={0}
        totalVersions={3}
      />,
    );

    expect(screen.getByText('Alice Andersen')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('Initial revision')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('renders initial version label for last index', () => {
    render(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={false}
        onSelect={vi.fn()}
        versionIndex={2}
        totalVersions={3}
      />,
    );
    expect(screen.getByText('Initial')).toBeInTheDocument();
  });

  it('renders vN label for middle indices', () => {
    render(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={false}
        onSelect={vi.fn()}
        versionIndex={1}
        totalVersions={3}
      />,
    );
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('renders policy badge and formatted text for policy comment', () => {
    const policyVersion: VersionHistory = {
      ...baseVersion,
      revision_comment:
        "Policy action 'block': blocked changed from False to True. Policy: CustomerEstimatedCostPolicy 4f1a2b3c. Scope: Project A.",
    };
    render(
      <VersionHistoryItem
        version={policyVersion}
        isSelected={false}
        onSelect={vi.fn()}
        versionIndex={0}
        totalVersions={1}
      />,
    );

    expect(screen.getByText('Policy')).toBeInTheDocument();
    expect(
      screen.getByText('blocked: False → True (Project A)'),
    ).toBeInTheDocument();
  });

  it('triggers onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={false}
        onSelect={onSelect}
        versionIndex={0}
        totalVersions={1}
      />,
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('reflects aria-current when selected', () => {
    const { rerender } = render(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={true}
        onSelect={vi.fn()}
        versionIndex={0}
        totalVersions={1}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true');

    rerender(
      <VersionHistoryItem
        version={baseVersion}
        isSelected={false}
        onSelect={vi.fn()}
        versionIndex={0}
        totalVersions={1}
      />,
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current');
  });
});
