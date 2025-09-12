import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  CustomerPermissionReview,
  customerPermissionsReviewsList,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { openModalDialog } from '@waldur/modal/actions';
import { SET_CURRENT_CUSTOMER } from '@waldur/workspace/constants';
import { checkIsOwner, getUser } from '@waldur/workspace/selectors';

const PendingMembershipReviewDialog = lazyComponent(() =>
  import('@waldur/core/PendingMembershipReviewDialog').then((module) => ({
    default: module.PendingMembershipReviewDialog,
  })),
);

function* checkPendingReview(action) {
  if (!isFeatureVisible(CustomerFeatures.show_permission_reviews)) {
    return;
  }
  const user = yield select(getUser);
  const { customer } = action.payload;
  // Skip review if user is not customer owner
  if (!checkIsOwner(customer, user)) {
    return;
  }
  try {
    const review: CustomerPermissionReview = yield call(() =>
      customerPermissionsReviewsList({
        query: {
          customer_uuid: customer.uuid,
          is_pending: true,
        },
      }).then((r) => r.data[0]),
    );
    if (review) {
      yield put(
        openModalDialog(PendingMembershipReviewDialog, {
          resolve: { reviewId: review.uuid, scope: 'customer' },
          size: 'xl',
        }),
      );
    }
  } catch {
    // Silently swallow error
  }
}

export default function* customerDetailsSaga() {
  yield takeLatest([SET_CURRENT_CUSTOMER], checkPendingReview);
}
