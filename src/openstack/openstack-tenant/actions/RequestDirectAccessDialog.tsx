import { useEffect, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const RequestDirectAccessDialog: FunctionComponent<{
  resolve: { resource };
}> = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      closeDialog();
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request direct access to OpenStack Tenant'),
            resource,
          },
          options: {
            title: translate('Request direct access to OpenStack Tenant'),
            descriptionPlaceholder: translate('Please provide a reason'),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
          hideProjectAndResourceFields: Boolean(resource.project),
        }),
      );
    }
  });

  return (
    <ModalDialog
      title={translate('Request direct access to {name}', {
        name: resource.name,
      })}
      footer={<CloseDialogButton label={translate('Ok')} />}
    >
      <p>
        {translate('To get access, please send a request to {supportEmail}.', {
          supportEmail: ENV.plugins.WALDUR_CORE.SITE_EMAIL,
        })}
      </p>
      <p>
        {translate(
          'Please note that request should specify tenant and provide a reason.',
        )}
      </p>
    </ModalDialog>
  );
};
