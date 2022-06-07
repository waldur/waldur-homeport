import formActionSaga from 'redux-form-saga';

import authSaga from '@waldur/auth/store/effects';
import downloadLinkSaga from '@waldur/core/DownloadLink/effects';
import customerDetailsSaga from '@waldur/customer/details/store/effects';
import organizationsSaga from '@waldur/customer/list/store/effects';
import paymentProfilesSaga from '@waldur/customer/payment-profiles/store/effects';
import paymentsSaga from '@waldur/customer/payments/store/effects';
import invoicesSaga from '@waldur/invoices/store/effects';
import issueAttachmentsSaga from '@waldur/issues/attachments/effects';
import issueCommentsSaga from '@waldur/issues/comments/effects';
import securityIncidentSaga from '@waldur/issues/security-incident/store/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';
import { sidebarSaga } from '@waldur/navigation/sidebar/store';
import { effects as titleEffects } from '@waldur/navigation/title';
import projectSaga from '@waldur/project/effects';
import providerSaga from '@waldur/providers/effects';
import serviceUsageSaga from '@waldur/providers/support/effects';
import resourceSummarySaga from '@waldur/resource/summary/effects';
import tableSaga from '@waldur/table/effects';
import userSaga from '@waldur/user/support/effects';

export default [
  authSaga,
  downloadLinkSaga,
  formActionSaga,
  projectSaga,
  userSaga,
  providerSaga,
  customerDetailsSaga,
  issueAttachmentsSaga,
  issueCommentsSaga,
  securityIncidentSaga,
  tableSaga,
  serviceUsageSaga,
  resourceSummarySaga,
  marketplaceSaga,
  paymentProfilesSaga,
  organizationsSaga,
  invoicesSaga,
  paymentsSaga,
  titleEffects,
  sidebarSaga,
];
