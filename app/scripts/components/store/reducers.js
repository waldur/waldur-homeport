import { combineReducers } from 'redux';

import { dashboardChart } from '@waldur/dashboard/chart/reducers';
import { reducer as tables } from '@waldur/table-react/store';

import { reducer as config } from './config';
import { reducer as currentProject } from './currentProject';
import { reducer as currentUser } from './currentUser';
import { reducer as locale } from './locale';

export default combineReducers({
  config,
  dashboardChart,
  tables,
  currentProject,
  currentUser,
  locale,
});
