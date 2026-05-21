import { FunctionComponent } from 'react';
import {
  customerPermissionsReviewsClose,
  projectPermissionsReviewsClose,
} from 'waldur-js-client';

import { CustomerUsersList } from '@/customer/team/CustomerUsersList';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProjectUsersList } from '@/project/team/ProjectUsersList';
import { useProject } from '@/workspace/hooks';

interface PendingMembershipReviewDialogProps {
  resolve: { reviewId: string; scope: 'customer' | 'project' };
}

export const PendingMembershipReviewDialog: FunctionComponent<
  PendingMembershipReviewDialogProps
> = ({ resolve: { reviewId, scope } }) => {
  const project = useProject();

  const closeReviewMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      if (scope === 'customer') {
        return customerPermissionsReviewsClose({ path: { uuid: reviewId } });
      } else if (scope === 'project') {
        return projectPermissionsReviewsClose({ path: { uuid: reviewId } });
      }
      return Promise.reject(new Error('Invalid scope'));
    },
    successMessage: translate('Membership review has been completed.'),
    errorMessage: translate('Unable to complete review.'),
  });

  const title =
    scope === 'customer'
      ? translate('Please review organization permissions')
      : translate('Please review project permissions');

  return (
    <ModalDialog
      title={title}
      footer={
        <>
          <CloseDialogButton
            className="min-w-125px"
            label={translate('Remind me later')}
          />
          <SubmitButton
            submitting={closeReviewMutation.isPending}
            onClick={() => closeReviewMutation.mutate()}
            type="button"
            label={translate('Complete review')}
          />
        </>
      }
    >
      {scope === 'customer' ? (
        <CustomerUsersList />
      ) : (
        <ProjectUsersList project={project} hideTabs />
      )}
    </ModalDialog>
  );
};
