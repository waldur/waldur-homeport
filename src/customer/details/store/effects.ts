import { SubmissionError, reset } from 'redux-form';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { PendingReviewDialog } from '@waldur/customer/team/PendingReviewDialog';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showSuccess, showError, emitSignal } from '@waldur/store/coreSaga';
import { SET_CURRENT_CUSTOMER } from '@waldur/workspace/constants';
import { checkIsOwner, getUser } from '@waldur/workspace/selectors';

import * as actions from './actions';
import * as api from './api';

export function* uploadLogo(action) {
  const { customerUuid, image } = action.payload;
  const successMessage = translate('Logo has been uploaded.');
  const errorMessage = translate('Unable to upload logo.');

  try {
    yield call(api.uploadLogo, { customerUuid, image });
    yield put(emitSignal('refreshCustomer'));
    yield put(actions.uploadLogo.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const formError = new SubmissionError({
      _error: errorMessage,
    });

    yield put(actions.uploadLogo.failure(formError));
  }
}

export function* removeLogo(action) {
  const { customer } = action.payload;
  const successMessage = translate('Logo has been removed.');
  const errorMessage = translate('Unable to remove logo.');

  try {
    yield put(reset('customerLogo'));
    if (customer.image) {
      yield call(api.removeLogo, { customerUuid: customer.uuid });
      yield put(emitSignal('refreshCustomer'));
      yield put(showSuccess(successMessage));
    }
  } catch (error) {
    yield put(showError(errorMessage));
  }
}

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
          size: 'lg',
        }),
      );
    }
  } catch (error) {
    // Silently swallow error
  }
}

export default function* customerDetailsSaga() {
  yield takeEvery(actions.uploadLogo.REQUEST, uploadLogo);
  yield takeEvery(actions.removeLogo.REQUEST, removeLogo);
  yield takeLatest([SET_CURRENT_CUSTOMER], checkPendingReview);
}
