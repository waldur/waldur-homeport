import { useEffect, FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { ISSUE_IDS } from '@/issues/types/constants';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export const RequestLimitsChangeDialog: FunctionComponent<{
  resolve: { resource };
}> = ({ resolve: { resource } }) => {
  const { openDialog, closeDialog } = useModal();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      closeDialog();
      openDialog(IssueCreateDialog, {
        resolve: {
          issue: {
            type: ISSUE_IDS.CHANGE_REQUEST,
            summary: translate('Request change of limits of SLURM allocation'),
            resource,
          },
          options: {
            title: translate('Request change of limits of SLURM allocation'),
            descriptionPlaceholder: translate(
              'Please provide requested limits and a reason.',
            ),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
          hideProjectAndResourceFields: true,
        },
        dialogClassName: 'modal-dialog-centered mw-650px',
        formId: ISSUE_CREATION_FORM_ID,
      });
    }
  }, [closeDialog, openDialog, resource]);

  return (
    <ModalDialog
      title={translate('Change of limits of SLURM allocation {name}', {
        name: resource.name,
      })}
      footer={<CloseDialogButton label={translate('Ok')} />}
    >
      <p>
        {translate(
          'To change allocation limits, please send a request to {supportEmail}.',
          { supportEmail: ENV.plugins.WALDUR_CORE.SITE_EMAIL },
        )}
      </p>
      <p>
        {translate(
          'Please note that request should specify allocation name and provide a reason for change.',
        )}
      </p>
    </ModalDialog>
  );
};
