import { combineReducers, Reducer } from 'redux';

import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { reducer as marketplace } from '@/marketplace/store/reducers';
import { INITIAL_STATE } from '@/table/constants';
import { tablesReducer } from '@/table/store';
import { type TablesState } from '@/table/types';
import { reducer as workspace } from '@/workspace/reducers';

// The sidebar's resource filters read the all-resources table's filters before
// that table first mounts, so its state exists from the start.
const tables: Reducer<TablesState> = (
  state = { [ALL_RESOURCES_TABLE_ID]: INITIAL_STATE },
  action,
) => tablesReducer(state, action);

const staticReducers = {
  workspace,
  marketplace,
  tables,
};

const combined = combineReducers(staticReducers);

export const RESET_SESSION = 'waldur/session/RESET';

/** Drops every slice at once — what a document reload used to do for free. */
export const resetSession = () => ({ type: RESET_SESSION });

export const rootReducer: typeof combined = (state, action) =>
  action.type === RESET_SESSION
    ? combined(undefined, action)
    : combined(state, action);

export type RootState = ReturnType<typeof combined>;
