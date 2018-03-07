import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { reducer as downloadLink } from '@waldur/core/DownloadLink/reducers';
import { dashboardChart } from '@waldur/dashboard/chart/reducers';
import { reducer as issues } from '@waldur/issues/reducers';
import { reducer as provider } from '@waldur/providers/reducers';
import { reducer as pythonManagementDetails } from '@waldur/python-management/reducers';
import { reducer as monitoring } from '@waldur/resource/monitoring/reducers';
import { reducer as tables } from '@waldur/table-react/store';
import { reducer as workspace } from '@waldur/workspace/reducers';

import { reducer as config } from './config';
import { reducer as locale } from './locale';

export default combineReducers({
  form: formReducer,
  config,
  dashboardChart,
  tables,
  issues,
  pythonManagementDetails,
  workspace,
  locale,
  provider,
  downloadLink,
  monitoring,
});
