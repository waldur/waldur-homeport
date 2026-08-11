import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import {
  DateRangeValue,
  presetToRange,
  rangeToPreset,
} from '@/reporting/orders/dateRangePresets';
import { OrdersFilter as TimePeriodFilter } from '@/reporting/orders/OrdersFilter';
import {
  SupportAIAssistantLogsList,
  TABLE_KEY as AUTHENTICATED_TABLE,
} from '@/support/SupportAIAssistantLogsList';
import * as tableActions from '@/table/actions';
import { TableWithTabs } from '@/table/TableWithTabs';
import { TableTab } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';

import {
  AnonymousChatPanel,
  TABLE_KEY as ANONYMOUS_TABLE,
} from './AnonymousChatPanel';
import { ChatChannel } from './sharedChatFilters';
import { useSharedChatFilters } from './useSharedChatFilters';

// Admin dashboard for the AI assistant. Reuses the shared TableWithTabs (the
// same component the Matrix admin dashboard uses) so each assistant channel is
// a tab: authenticated chat threads and anonymous marketplace interactions.
const TABS: TableTab[] = [
  {
    key: 'authenticated',
    title: translate('Authenticated chat'),
    component: SupportAIAssistantLogsList,
  },
  {
    key: 'anonymous',
    title: translate('Anonymous chat'),
    component: AnonymousChatPanel,
  },
];

// The preset writes into the very field the drawer's range picker owns rather
// than a parallel query param, so there is one source of truth: the picker's
// chip updates to match, and the summary follows because it is already scoped
// from the same filter.
const RANGE_FILTER = 'created_range';

export const SupportAIAssistantDashboard: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { params } = useCurrentStateAndParams();

  // Read from the tab on screen: each table owns its filter storage, so a
  // header that averaged the two would describe neither.
  const activeChannel: ChatChannel =
    params?.tab === 'anonymous' ? 'anonymous' : 'authenticated';
  const activeTable =
    activeChannel === 'anonymous' ? ANONYMOUS_TABLE : AUTHENTICATED_TABLE;

  // Carries every shared filter — not just the period — to the other tab.
  useSharedChatFilters(activeChannel);

  const range: DateRangeValue | undefined =
    useFilterValues(activeTable)[RANGE_FILTER];

  // Derived every render, never stored. A local copy outlives nothing — it dies
  // on reload while the filter survives, and it survives a "Clear filters" the
  // filter does not — so either way it ends up naming a period the rows are not
  // under.
  const days = rangeToPreset(range);

  const setRange = useCallback(
    (value: DateRangeValue | null) => {
      // Only the tab on screen: useSharedChatFilters carries it to the other,
      // so the period does not need its own copy of that rule. setFilter lands
      // in filtersStorage, which is what useFilterValues selects from, so no
      // separate apply step is needed; a null value drops the filter entirely.
      dispatch(
        tableActions.setFilter(activeTable, {
          name: RANGE_FILTER,
          value,
          label: null,
          component: null,
        }),
      );
    },
    [dispatch, activeTable],
  );

  const applyPeriod = useCallback(
    (selected: number) => setRange(presetToRange(selected)),
    [setRange],
  );

  const clearPeriod = useCallback(() => setRange(null), [setRange]);

  return (
    <TableWithTabs
      title={translate('AI assistant logs')}
      tabs={TABS}
      syncWithUrlKey="tab"
      // headerActions, not actions: the latter renders beside the tab strip
      // (TableWithTabs.tsx:147), which put the control a row below the title.
      headerActions={
        <TimePeriodFilter
          inCardHeader
          days={days}
          onDaysChange={applyPeriod}
          onAllTime={clearPeriod}
          isCustom={Boolean(range) && days === undefined}
        />
      }
    />
  );
};
