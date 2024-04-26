import { call, put, select, takeLatest } from 'redux-saga/effects';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { SET_CURRENT_CUSTOMER } from '@waldur/workspace/constants';
import { checkIsOwner, getUser } from '@waldur/workspace/selectors';

import * as api from '../api';

const PendingReviewDialog = lazyComponent(
  () => import('@waldur/customer/team/PendingReviewDialog'),
  'PendingReviewDialog',
);

function* checkPendingReview(action) {
  const user = yield select(getUser);
  const { customer } = action.payload;
  // Skip review if user is not customer owner
  if (!checkIsOwner(customer, user)) {
    return;
  }
  try {
    const review = yield call(api.getPendingReview, customer.uuid);
    if (review) {
      yield put(
        openModalDialog(PendingReviewDialog, {
          resolve: { reviewId: review.uuid },
          size: 'xl',
        }),
      );
    }
  } catch (error) {
    // Silently swallow error
  }
}

export default function* customerDetailsSaga() {
  yield takeLatest([SET_CURRENT_CUSTOMER], checkPendingReview);
}
