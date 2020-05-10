import formActionSaga from 'redux-form-saga';

import authSaga from '@waldur/auth/store/effects';
import bookingSaga from '@waldur/booking/store/effects';
import downloadLinkSaga from '@waldur/core/DownloadLink/effects';
import customerDetailsSaga from '@waldur/customer/details/store/effects';
import paymentProfilesSaga from '@waldur/customer/payment-profiles/store/effects';
import issueAttachmentsSaga from '@waldur/issues/attachments/effects';
import issueCommentsSaga from '@waldur/issues/comments/effects';
import jiraSaga from '@waldur/jira/issue/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';
import modalSaga from '@waldur/modal/effects';
import projectSaga from '@waldur/project/effects';
import providerSaga from '@waldur/providers/effects';
import serviceUsageSaga from '@waldur/providers/support/effects';
import monitoringSaga from '@waldur/resource/monitoring/effects';
import resourceSummarySaga from '@waldur/resource/summary/effects';
import tableSaga from '@waldur/table-react/effects';
import userSaga from '@waldur/user/support/effects';

import coreSaga from './coreSaga';

export default [
  coreSaga,
  authSaga,
  bookingSaga,
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
  serviceUsageSaga,
  resourceSummarySaga,
  marketplaceSaga,
  paymentProfilesSaga,
];
