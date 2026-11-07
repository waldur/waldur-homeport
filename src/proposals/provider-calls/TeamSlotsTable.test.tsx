import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfferingTeamSlot } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { getSlotHolder } from './providerCalls';
import { SlotHolderCell } from './TeamSlotsTable';

const slot = (values: Partial<OfferingTeamSlot>): OfferingTeamSlot => ({
  uuid: 's1',
  proposal_uuid: 'p1',
  proposal_name: 'Climate model',
  proposal_slug: 'P-1',
  call_name: 'Spring call',
  offering_name: 'Cluster partition',
  requested_offering_uuid: 'ro1',
  step_name: 'Technical assessment',
  step_key: 'technical_assessment',
  status: 'pending',
  delegate_uuid: null,
  delegate_name: null,
  delegate_accepted: false,
  stand_in: false,
  due_at: null,
  overdue: false,
  ...values,
});

describe('SlotHolderCell', () => {
  it('names the person a slot was handed to, pending until they accept', () => {
    renderWithProviders(
      <SlotHolderCell
        row={slot({ delegate_uuid: 'u1', delegate_name: 'Ada Lovelace' })}
      />,
    );
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('marks a hand-on the person took over', () => {
    renderWithProviders(
      <SlotHolderCell
        row={slot({
          delegate_uuid: 'u1',
          delegate_name: 'Ada Lovelace',
          delegate_accepted: true,
        })}
      />,
    );
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('warns when the call’s managers stand in for an empty team', () => {
    renderWithProviders(<SlotHolderCell row={slot({ stand_in: true })} />);
    expect(screen.getByText('Call managers stand in')).toBeInTheDocument();
  });

  it('leaves a slot nobody was handed with the offering’s managers', () => {
    renderWithProviders(<SlotHolderCell row={slot({})} />);
    expect(screen.getByText('Offering managers')).toBeInTheDocument();
  });
});

describe('getSlotHolder', () => {
  it('prefers a hand-on over a stand-in', () => {
    expect(
      getSlotHolder(
        slot({ delegate_uuid: 'u1', delegate_name: 'Ada', stand_in: true }),
      ).kind,
    ).toBe('delegate');
  });
});
