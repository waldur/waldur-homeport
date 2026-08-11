import { isEqual } from 'lodash-es';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getQueryParams, syncFiltersToURL } from '@/core/filters';
import { TABLE_KEY as AUTHENTICATED_TABLE } from '@/support/SupportAIAssistantLogsList';
import * as tableActions from '@/table/actions';
import { getTableState } from '@/table/selectors';
import { useFilterValues } from '@/table/useFilterValues';

import { TABLE_KEY as ANONYMOUS_TABLE } from './AnonymousChatPanel';
import {
  ChatChannel,
  SHARED_CHAT_FILTERS,
  otherChannel,
} from './sharedChatFilters';

const TABLE_BY_CHANNEL: Record<ChatChannel, string> = {
  authenticated: AUTHENTICATED_TABLE,
  anonymous: ANONYMOUS_TABLE,
};

/**
 * Keeps the scope the user set on the tab they are looking at true on the other
 * tab as well.
 *
 * Only the tab on screen is mounted, so only it writes to the URL and only it
 * can be edited — mirroring one way, active to inactive, is enough and cannot
 * ping-pong.
 */
export const useSharedChatFilters = (activeChannel: ChatChannel) => {
  const dispatch = useDispatch();
  const inactiveChannel = otherChannel(activeChannel);
  const inactiveTable = TABLE_BY_CHANNEL[inactiveChannel];

  const activeValues = useFilterValues(TABLE_BY_CHANNEL[activeChannel]);
  const inactiveValues = useFilterValues(inactiveTable);

  // The free-text term is not a filter: it lives on the table slice, so it is
  // read and written through its own action rather than filtersStorage.
  const activeQuery =
    useSelector(getTableState(TABLE_BY_CHANNEL[activeChannel]))?.query ?? '';
  const inactiveQuery = useSelector(getTableState(inactiveTable))?.query ?? '';

  // Because it is not in filtersStorage, useTable's URL sync never sees it.
  // Restoring it here is what makes the search survive a reload the way every
  // filter beside it does.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) {
      return;
    }
    seededRef.current = true;
    const fromUrl = getQueryParams().query;
    if (!fromUrl) {
      return;
    }
    Object.values(TABLE_BY_CHANNEL).forEach((table) =>
      dispatch(tableActions.setFilterQuery(table, String(fromUrl))),
    );
  }, [dispatch]);

  useEffect(() => {
    if (inactiveQuery === activeQuery) {
      return;
    }
    dispatch(tableActions.setFilterQuery(inactiveTable, activeQuery));
    // Null deletes the param; an empty string would leave `?query=` behind.
    syncFiltersToURL({ query: activeQuery || null });
  }, [activeQuery, inactiveQuery, inactiveTable, dispatch]);

  useEffect(() => {
    SHARED_CHAT_FILTERS.forEach((shared) => {
      const from = shared[activeChannel];
      const to = shared[inactiveChannel];
      // Null rather than undefined: SET_FILTER reads an empty value as a
      // removal, which is how a cleared filter reaches the other tab.
      const value = activeValues[from] ?? null;

      if (isEqual(inactiveValues[to] ?? null, value)) {
        return;
      }

      dispatch(
        tableActions.setFilter(inactiveTable, {
          name: to,
          value,
          label: null,
          component: null,
        }),
      );

      // When the two channels use the same name, the mounted table's own sync
      // effect owns that param. When they differ, nobody does: the counterpart
      // belongs to a table that is unmounted, so a stale copy would sit in the
      // URL and re-seed the filter the user just cleared.
      if (from !== to) {
        syncFiltersToURL({ [to]: value });
      }
    });
  }, [
    activeChannel,
    inactiveChannel,
    inactiveTable,
    activeValues,
    inactiveValues,
    dispatch,
  ]);
};
