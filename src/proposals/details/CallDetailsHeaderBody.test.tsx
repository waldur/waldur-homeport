import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import {
  CallDetailsHeaderBody,
  pickHeaderRound,
} from './CallDetailsHeaderBody';

const round = (uuid: string, status: string, start: string, extra = {}) => ({
  uuid,
  status,
  start_time: start,
  cutoff_time: '2026-09-24T17:00:00Z',
  ...extra,
});

describe('the round a call’s header is about', () => {
  it('is the open one, whatever order the rounds come in', () => {
    const rounds = [
      round('old', 'ended', '2026-01-01T00:00:00Z'),
      round('now', 'open', '2026-06-01T00:00:00Z'),
    ] as any;
    expect(pickHeaderRound(rounds)?.uuid).toBe('now');
  });

  it('is the next scheduled one when none is open, else the last ended', () => {
    expect(
      pickHeaderRound([
        round('old', 'ended', '2026-01-01T00:00:00Z'),
        round('next', 'scheduled', '2027-01-01T00:00:00Z'),
      ] as any)?.uuid,
    ).toBe('next');
    expect(
      pickHeaderRound([
        round('first', 'ended', '2026-01-01T00:00:00Z'),
        round('last', 'ended', '2026-06-01T00:00:00Z'),
      ] as any)?.uuid,
    ).toBe('last');
  });
});

describe('CallDetailsHeaderBody', () => {
  it('does not call an active call closed when only its round ended', () => {
    renderWithProviders(
      <CallDetailsHeaderBody
        call={
          {
            state: 'active',
            rounds: [
              round('r', 'ended', '2026-07-16T00:00:00Z', {
                lifecycle_state: 'evaluating',
              }),
            ],
          } as any
        }
      />,
    );
    const note = screen.getByTestId('no-open-round');
    expect(note).toHaveTextContent('No round is open for submissions');
    expect(note).toHaveTextContent('Its proposals are being evaluated.');
    expect(note).not.toHaveTextContent('closed.');
  });

  it('says a call without rounds has none yet', () => {
    renderWithProviders(
      <CallDetailsHeaderBody call={{ state: 'draft', rounds: [] } as any} />,
    );
    expect(screen.getByText('The call has no rounds yet.')).toBeInTheDocument();
  });
});
