import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import {
  CallOfferingComponentRules,
  getComponentRuleRows,
  getRulesLockReason,
} from './CallOfferingComponentRules';

const component = (type: string, overrides = {}) => ({
  type,
  name: type.toUpperCase(),
  measured_unit: 'hours',
  limit_period: 'total',
  unit_factor: 1,
  min_value: null,
  max_value: null,
  limit_decimal_places: 0,
  ...overrides,
});

const offering = (overrides = {}) =>
  ({
    uuid: 'ro1',
    offering_name: 'HPC',
    requestable_components: [
      component('cpu'),
      component('storage', { measured_unit: 'GB', limit_period: 'month' }),
      component('gpu'),
    ],
    component_rules: [
      {
        uuid: 'r1',
        component_type: 'cpu',
        min_per_proposal: 1000,
        max_per_proposal: 100000,
        default_amount: 10000,
        is_fixed: false,
      },
      {
        uuid: 'r2',
        component_type: 'gpu',
        min_per_proposal: 500,
        max_per_proposal: 500,
        default_amount: 500,
        is_fixed: true,
      },
    ],
    rules_locked: false,
    ...overrides,
  }) as any;

const renderRules = (row: any, readOnlyReason?: string) =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>
        <CallOfferingComponentRules
          offering={row}
          call={{ uuid: 'call1' } as any}
          refetch={() => undefined}
          readOnlyReason={readOnlyReason}
        />
      </Provider>
    </DrawerProvider>,
  );

describe('getComponentRuleRows', () => {
  it('lists every requestable component with its rule if any', () => {
    const rows = getComponentRuleRows(offering());
    expect(rows.map((row) => [row.component.type, row.rule?.uuid])).toEqual([
      ['cpu', 'r1'],
      ['storage', undefined],
      ['gpu', 'r2'],
    ]);
  });
});

describe('getRulesLockReason', () => {
  it('says why the rules no longer change', () => {
    expect(getRulesLockReason({ rules_locked: false })).toBeUndefined();
    expect(getRulesLockReason({ rules_locked: true })).toMatch(
      /submitted proposal/,
    );
    expect(getRulesLockReason({ rules_locked: false }, 'Archived')).toBe(
      'Archived',
    );
  });
});

describe('CallOfferingComponentRules', () => {
  it('shows each component with its unit and what a proposal may request', async () => {
    renderRules(offering());
    expect(await screen.findByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('GB per month')).toBeInTheDocument();
    expect(screen.getByText('1,000 – 100,000')).toBeInTheDocument();
    expect(screen.getByText('Fixed at 500 hours')).toBeInTheDocument();
    expect(screen.getByText('Any amount')).toBeInTheDocument();
    expect(
      screen.getByText(/Editable until a proposal requesting this offering/),
    ).toBeInTheDocument();
  });

  it('states the lock once a submitted proposal requests the offering', async () => {
    renderRules(offering({ rules_locked: true }));
    expect(
      await screen.findByText(/A submitted proposal requests this offering/),
    ).toBeInTheDocument();
  });
});
