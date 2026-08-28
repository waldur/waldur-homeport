import { combineReducers } from 'redux';

import { reducer as marketplace } from '@/marketplace/store/reducers';
import { tableInitialReducer as tables } from '@/table/store';
import { type TableState } from '@/table/types';
import { reducer as workspace } from '@/workspace/reducers';

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

export type RootState = ReturnType<typeof combined> & {
  tables: Record<string, TableState>;
};
