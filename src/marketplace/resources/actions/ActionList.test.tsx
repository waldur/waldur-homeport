import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActionItem } from '@/resource/actions/ActionItem';

import { ActionList, isActionVisible } from './ActionList';

describe('isActionVisible', () => {
  it('shows every action with an empty filter', () => {
    expect(isActionVisible({}, { label: 'Stop' })).toBe(true);
  });

  it("hides an action switched off for the resource's offering", () => {
    const resource = {
      offering_plugin_options: { disabled_resource_actions: ['stop'] },
    };
    expect(
      isActionVisible({}, { label: 'Stop', actionId: 'stop' as any, resource }),
    ).toBe(false);
  });

  it('matches the query case-insensitively against the label', () => {
    expect(isActionVisible({ query: 'sto' }, { label: 'Stop' })).toBe(true);
    expect(isActionVisible({ query: 'STO' }, { label: 'Stop' })).toBe(true);
    expect(isActionVisible({ query: 'start' }, { label: 'Stop' })).toBe(false);
  });

  it('hides disabled and non-important actions when asked', () => {
    expect(
      isActionVisible(
        { hideDisabled: true },
        { label: 'Stop', disabled: true },
      ),
    ).toBe(false);
    expect(isActionVisible({ hideNonImportant: true }, { label: 'Stop' })).toBe(
      false,
    );
    expect(
      isActionVisible(
        { hideNonImportant: true },
        { label: 'Stop', important: true },
      ),
    ).toBe(true);
  });
});

describe('ActionList', () => {
  it('filters the ActionItems inside it', () => {
    render(
      <ActionList query="st">
        <ActionItem title="Start" action={vi.fn()} />
        <ActionItem title="Restart" action={vi.fn()} />
        <ActionItem title="Delete" action={vi.fn()} />
      </ActionList>,
    );
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });
});
