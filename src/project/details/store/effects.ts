import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  ProjectPermissionReview,
  projectPermissionsReviewsList,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { SET_CURRENT_PROJECT } from '@waldur/workspace/constants';
import { getUser } from '@waldur/workspace/selectors';

const PendingReviewDialog = lazyComponent(() =>
  import('@waldur/core/PendingMembershipReviewDialog').then((module) => ({
    default: module.PendingMembershipReviewDialog,
  })),
);

function* checkPendingReview(action) {
  if (!isFeatureVisible(CustomerFeatures.show_permission_reviews)) {
    return;
  }
  const user = yield select(getUser);
  const { project } = action.payload;

  // Skip review if user doesn't have REVIEW_PROJECT_MEMBERSHIP permission
  if (
    !hasPermission(user, {
      permission: PermissionEnum.REVIEW_PROJECT_MEMBERSHIP,
      projectId: project.uuid,
    }) ||
    user.is_staff
  ) {
    return;
  }

  try {
    const review: ProjectPermissionReview = yield call(() =>
      projectPermissionsReviewsList({
        query: {
          project_uuid: project.uuid,
          is_pending: true,
        },
      }).then((r) => r.data[0]),
    );
    if (review) {
      yield put(
        openModalDialog(PendingReviewDialog, {
          resolve: { reviewId: review.uuid, scope: 'project' },
          size: 'xl',
        }),
      );
    }
  } catch {
    // Silently swallow error
  }
}

export default function* projectDetailsSaga() {
  yield takeLatest([SET_CURRENT_PROJECT], checkPendingReview);
}
