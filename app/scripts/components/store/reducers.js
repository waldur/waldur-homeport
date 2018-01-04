import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { dashboardChart } from '@waldur/dashboard/chart/reducers';
import { reducer as tables } from '@waldur/table-react/store';

import { reducer as config } from './config';
import { reducer as currentCustomer } from './currentCustomer';
import { reducer as currentProject } from './currentProject';
import { reducer as currentUser } from './currentUser';
import { reducer as locale } from './locale';

export default combineReducers({
  form: formReducer,
  config,
  dashboardChart,
  tables,
  currentCustomer,
  currentProject,
  currentUser,
  locale,
});
