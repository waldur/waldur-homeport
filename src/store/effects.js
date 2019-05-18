import formActionSaga from 'redux-form-saga';

import analytics from '@waldur/analytics/effects';
import authSaga from '@waldur/auth/store/effects';
import downloadLinkSaga from '@waldur/core/DownloadLink/effects';
import jiraSaga from '@waldur/jira/issue/effects';
import issueAttachmentsSaga from '@waldur/issues/attachments/effects';
import issueCommentsSaga from '@waldur/issues/comments/effects';
import modalSaga from '@waldur/modal/effects';
import projectSaga from '@waldur/project/effects';
import userSaga from '@waldur/user/support/effects';
import providerSaga from '@waldur/providers/effects';
import customerDetailsSaga from '@waldur/customer/details/store/effects';
import tableSaga from '@waldur/table-react/effects';
import monitoringSaga from '@waldur/resource/monitoring/effects';
import pythonManagementSaga from '@waldur/ansible/python-management/effects';
import jupyterHubManagementSaga from '@waldur/ansible/jupyter-hub-management/effects';
import serviceUsageSaga from '@waldur/providers/support/effects';
import resourceSummarySaga from '@waldur/resource/summary/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';

import coreSaga from './coreSaga';

export default [
  coreSaga,
  analytics,
  authSaga,
  downloadLinkSaga,
  formActionSaga,
  jiraSaga,
  projectSaga,
  userSaga,
  providerSaga,
  customerDetailsSaga,
  issueAttachmentsSaga,
  issueCommentsSaga,
  modalSaga,
  tableSaga,
  monitoringSaga,
  pythonManagementSaga,
  jupyterHubManagementSaga,
  serviceUsageSaga,
  resourceSummarySaga,
  marketplaceSaga,
];
