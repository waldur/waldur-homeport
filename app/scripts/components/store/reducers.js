import { combineReducers } from 'redux';

import { dashboardChart } from '@waldur/dashboard/chart/reducers';
import { reducer as tables } from '@waldur/table-react/store';

import { reducer as currentUser } from './currentUser';
import { reducer as locale } from './locale';
import { reducer as config } from './config';

export default combineReducers({
  dashboardChart,
  tables,
  currentUser,
  locale,
  config,
});
