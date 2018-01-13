import formActionSaga from 'redux-form-saga';

import downloadLinkSaga from '@waldur/core/DownloadLink/effects';
import chartSaga from '@waldur/dashboard/chart/effects';
import jiraSaga from '@waldur/jira/issue/effects';
import modalSaga from '@waldur/modal/effects';
import projectSaga from '@waldur/project/effects';
import providerSaga from '@waldur/providers/effects';
import tableSaga from '@waldur/table-react/effects';

import coreSaga from './coreSaga';

export default [
  coreSaga,
  downloadLinkSaga,
  formActionSaga,
  chartSaga,
  jiraSaga,
  projectSaga,
  providerSaga,
  modalSaga,
  tableSaga,
];
