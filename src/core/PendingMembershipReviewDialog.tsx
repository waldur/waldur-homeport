import { useState, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  customerPermissionsReviewsClose,
  projectPermissionsReviewsClose,
} from 'waldur-js-client';

import { CustomerUsersList } from '@/customer/team/CustomerUsersList';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ProjectUsersList } from '@/project/team/ProjectUsersList';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { getProject } from '@/workspace/selectors';

interface PendingMembershipReviewDialogProps {
  resolve: { reviewId: string; scope: 'customer' | 'project' };
}

export const PendingMembershipReviewDialog: FunctionComponent<
  PendingMembershipReviewDialogProps
> = ({ resolve: { reviewId, scope } }) => {
  const dispatch = useDispatch();
  const project = useSelector(getProject);

  const [submitting, setSubmitting] = useState(false);

  const closeReviewCallback = async () => {
    setSubmitting(true);
    try {
      if (scope === 'customer') {
        await customerPermissionsReviewsClose({ path: { uuid: reviewId } });
      } else if (scope === 'project') {
        await projectPermissionsReviewsClose({ path: { uuid: reviewId } });
      }
      dispatch(showSuccess(translate('Membership review has been completed.')));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to complete review.')));
    }
    setSubmitting(false);
  };

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
            submitting={submitting}
            onClick={closeReviewCallback}
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
