import { Middleware } from 'redux';
import {
  CustomerPermissionReview,
  ProjectPermissionReview,
  customerPermissionsReviewsList,
  projectPermissionsReviewsList,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RootState } from '@/store/reducers';

import { SET_CURRENT_CUSTOMER, SET_CURRENT_PROJECT } from './constants';
import { checkIsOwner, getUser } from './selectors';

const PendingReviewDialog = lazyComponent(() =>
  import('@/core/PendingMembershipReviewDialog').then((module) => ({
    default: module.PendingMembershipReviewDialog,
  })),
);

// AbortControllers to cancel pending requests when a new navigation occurs
let projectReviewAbortController: AbortController | null = null;
let customerReviewAbortController: AbortController | null = null;

async function checkProjectPendingReview(store, action, signal: AbortSignal) {
  if (!isFeatureVisible(CustomerFeatures.show_permission_reviews)) {
    return;
  }

  const state: RootState = store.getState();
  const user = getUser(state);
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
    const response = await projectPermissionsReviewsList({
      query: {
        project_uuid: project.uuid,
        is_pending: true,
      },
      signal,
    });
    // Check if request was aborted before showing modal
    if (signal.aborted) {
      return;
    }
    const review: ProjectPermissionReview = response.data[0];
    if (review) {
      store.dispatch(
        openModalDialog(PendingReviewDialog, {
          resolve: { reviewId: review.uuid, scope: 'project' },
          size: 'xl',
        }),
      );
    }
  } catch {
    // Silently swallow error (including abort errors)
  }
}

async function checkCustomerPendingReview(store, action, signal: AbortSignal) {
  if (!isFeatureVisible(CustomerFeatures.show_permission_reviews)) {
    return;
  }

  const state: RootState = store.getState();
  const user = getUser(state);
  const { customer } = action.payload;

  // Skip review if user is not customer owner
  if (!checkIsOwner(customer, user)) {
    return;
  }

  try {
    const response = await customerPermissionsReviewsList({
      query: {
        customer_uuid: customer.uuid,
        is_pending: true,
      },
      signal,
    });
    // Check if request was aborted before showing modal
    if (signal.aborted) {
      return;
    }
    const review: CustomerPermissionReview = response.data[0];
    if (review) {
      store.dispatch(
        openModalDialog(PendingReviewDialog, {
          resolve: { reviewId: review.uuid, scope: 'customer' },
          size: 'xl',
        }),
      );
    }
  } catch {
    // Silently swallow error (including abort errors)
  }
}

export const reviewCheckMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    // Handle review checks after the action is processed
    if (action.type === SET_CURRENT_PROJECT) {
      // Cancel any pending project review request
      projectReviewAbortController?.abort();
      projectReviewAbortController = new AbortController();
      checkProjectPendingReview(
        store,
        action,
        projectReviewAbortController.signal,
      );
    } else if (action.type === SET_CURRENT_CUSTOMER) {
      // Cancel any pending customer review request
      customerReviewAbortController?.abort();
      customerReviewAbortController = new AbortController();
      checkCustomerPendingReview(
        store,
        action,
        customerReviewAbortController.signal,
      );
    }

    return result;
  };
