import { combineReducers } from 'redux';

import { reducer as marketplace } from '@/marketplace/store/reducers';
import { tableInitialReducer as tables } from '@/table/store';
import { type TableState } from '@/table/types';
import { reducer as workspace } from '@/workspace/reducers';

export const staticReducers = {
  workspace,
  marketplace,
  tables,
};

const _rootReducer = combineReducers(staticReducers);

export type RootState = ReturnType<typeof _rootReducer> & {
  tables: Record<string, TableState>;
};
