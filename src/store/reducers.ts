import { reducer as notificationsReducer } from 'reapop';
import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';

import { reducer as drawer } from '@waldur/drawer/reducer';
import { reducer as marketplace } from '@waldur/marketplace/store/reducers';
import { reducer as modal } from '@waldur/modal/reducer';
import { reducer as title } from '@waldur/navigation/title';
import { tableInitialReducer as tables } from '@waldur/table/store';
import { type TableState } from '@waldur/table/types';
import { reducer as workspace } from '@waldur/workspace/reducers';

export const staticReducers = {
  form,
  notifications: notificationsReducer(),
  modal,
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
