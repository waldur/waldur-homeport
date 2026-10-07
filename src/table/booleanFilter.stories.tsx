import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Accordion } from 'waldur-ui';

import { FilterContextProvider } from './FilterContextProvider';
import { BooleanFilter } from './filters';
import { selectFilterValues } from './selectors';
import { tableInitialReducer } from './store';

/**
 * `BooleanFilter`: a switch that narrows a table, for example "Active only".
 * It is the table-filter adapter over waldur-ui's `Switch`, so the filter's
 * title is the switch's label, and the switch writes `true` into the table's
 * filter state, which is what the list request is built from.
 *
 * The stories use the real table reducer, so a click really changes the stored
 * filter. They render the sidebar form of the filter (an accordion row); the
 * "Add filter" popover is covered by the `TableFiltersMenu` stories.
 */
const meta: Meta = {
  title: 'Data Display/Table/Boolean filter',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const TABLE = 'story-boolean-filter';
const noop = () => undefined;

const FilterValue = () => {
  const values = useSelector(selectFilterValues(TABLE));
  return <code data-testid="filter-value">{JSON.stringify(values)}</code>;
};

const Harness = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() =>
    createStore(combineReducers({ tables: tableInitialReducer })),
  );
  return (
    <Provider store={store}>
      <FilterContextProvider
        table={TABLE}
        filters={null}
        formId="story-boolean-filter-form"
        filterPosition="sidebar"
        setFilter={noop}
        applyFiltersFn={noop}
        selectedSavedFilter={null}
      >
        <div style={{ maxWidth: 320 }}>
          <Accordion type="multiple" defaultValue={['active', 'conceal']}>
            {children}
          </Accordion>
          <FilterValue />
        </div>
      </FilterContextProvider>
    </Provider>
  );
};

const readValue = (canvas: ReturnType<typeof within>) =>
  JSON.parse(canvas.getByTestId('filter-value').textContent ?? '{}');

export const TitleNamesTheSwitch: Story = {
  render: () => (
    <Harness>
      <BooleanFilter title="Active only" name="active" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The title is the label, so the switch has a name and a click on the
    // text reaches it.
    const control = await canvas.findByRole('checkbox', {
      name: 'Active only',
    });
    await expect(control).not.toBeChecked();
    await userEvent.click(canvas.getAllByText('Active only').pop()!);
    await expect(control).toBeChecked();
  },
};

export const TogglingWritesTheFilter: Story = {
  render: () => (
    <Harness>
      <BooleanFilter title="Active only" name="active" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = await canvas.findByRole('checkbox', {
      name: 'Active only',
    });
    await userEvent.click(control);
    await waitFor(() => expect(readValue(canvas).active).toBe(true));
    await userEvent.click(control);
    await waitFor(() => expect(readValue(canvas).active).toBe(false));
  },
};

export const BadgeShowsAndClears: Story = {
  render: () => (
    <Harness>
      <BooleanFilter
        title="Conceal compensation items"
        name="conceal"
        showValueBadge
        badgeValue={(value) => (value ? 'Conceal compensation items' : 'All')}
        ellipsis={false}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = await canvas.findByRole('checkbox', {
      name: 'Conceal compensation items',
    });
    await userEvent.click(control);
    const remove = await canvas.findByRole('button', {
      name: /Remove Conceal compensation items/,
    });
    await userEvent.click(remove);
    // Removing the badge clears the filter and switches the control off.
    await waitFor(() => expect(control).not.toBeChecked());
    await waitFor(() => expect(readValue(canvas).conceal).toBeFalsy());
  },
};
