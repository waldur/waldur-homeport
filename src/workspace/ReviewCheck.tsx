import { FC, useEffect } from 'react';
import {
  projectPermissionsReviewsList,
  customerPermissionsReviewsList,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';
import { checkIsOwner } from '@/workspace/selectors';

const PendingReviewDialog = lazyComponent(() =>
  import('@/core/PendingMembershipReviewDialog').then((module) => ({
    default: module.PendingMembershipReviewDialog,
  })),
);

export const useReviewCheck = () => {
  const { openDialog } = useModal();
  const customer = useCustomer();
  const project = useProject();
  const user = useUser();

  // 1. Project Review Check Effect
  useEffect(() => {
    if (
      !project ||
      !user ||
      !isFeatureVisible(CustomerFeatures.show_permission_reviews)
    ) {
      return;
    }

    if (
      !hasPermission(user, {
        permission: PermissionEnum.REVIEW_PROJECT_MEMBERSHIP,
        projectId: project.uuid,
      }) ||
      user.is_staff
    ) {
      return;
    }

    const controller = new AbortController();

    const checkProject = async () => {
      try {
        const response = await projectPermissionsReviewsList({
          query: {
            project_uuid: project.uuid,
            is_pending: true,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const review = response.data[0];
        if (review) {
          openDialog(PendingReviewDialog, {
            resolve: { reviewId: review.uuid, scope: 'project' },
            size: 'xl',
          });
        }
      } catch {
        // Silently swallow fetch and abort errors
      }
    };

    checkProject();

    return () => {
      controller.abort();
    };
  }, [project?.uuid, user?.uuid]);

  // 2. Customer Review Check Effect
  useEffect(() => {
    if (
      !customer ||
      !user ||
      !isFeatureVisible(CustomerFeatures.show_permission_reviews)
    ) {
      return;
    }

    if (!checkIsOwner(customer, user)) {
      return;
    }

    const controller = new AbortController();

    const checkCustomer = async () => {
      try {
        const response = await customerPermissionsReviewsList({
          query: {
            customer_uuid: customer.uuid,
            is_pending: true,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const review = response.data[0];
        if (review) {
          openDialog(PendingReviewDialog, {
            resolve: { reviewId: review.uuid, scope: 'customer' },
            size: 'xl',
          });
        }
      } catch {
        // Silently swallow fetch and abort errors
      }
    };

    checkCustomer();

    return () => {
      controller.abort();
    };
  }, [customer?.uuid, user?.uuid]);
};

export const ReviewCheck: FC = () => {
  useReviewCheck();
  return null;
};
