import formActionSaga from 'redux-form-saga';

import customerDetailsSaga from '@waldur/customer/details/store/effects';
import organizationsSaga from '@waldur/customer/list/store/effects';
import paymentProfilesSaga from '@waldur/customer/payment-profiles/store/effects';
import paymentsSaga from '@waldur/customer/payments/store/effects';
import invoicesSaga from '@waldur/invoices/store/effects';
import issueAttachmentsSaga from '@waldur/issues/attachments/effects';
import issueCommentsSaga from '@waldur/issues/comments/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import projectSaga from '@waldur/project/effects';
import tableSaga from '@waldur/table/effects';
import userSaga from '@waldur/user/support/effects';
import workspaceSaga from '@waldur/workspace/effects';

export default [
  formActionSaga,
  projectSaga,
  userSaga,
  customerDetailsSaga,
  issueAttachmentsSaga,
  issueCommentsSaga,
  tableSaga,
  marketplaceSaga,
  paymentProfilesSaga,
  organizationsSaga,
  invoicesSaga,
  paymentsSaga,
  titleEffects,
  workspaceSaga,
];
