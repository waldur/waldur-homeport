import { combineReducers } from 'redux';

import { reducer as drawer } from '@/drawer/reducer';
import { reducer as marketplace } from '@/marketplace/store/reducers';
import { reducer as title } from '@/navigation/title';
import { tableInitialReducer as tables } from '@/table/store';
import { type TableState } from '@/table/types';
import { reducer as workspace } from '@/workspace/reducers';

export const staticReducers = {
  drawer,
  workspace,
  marketplace,
  title,
  tables,
};

const _rootReducer = combineReducers(staticReducers);

export type RootState = ReturnType<typeof _rootReducer> & {
  tables: Record<string, TableState>;
};
