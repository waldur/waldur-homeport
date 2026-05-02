import { useEffect, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { ISSUE_IDS } from '@/issues/types/constants';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export const RequestActionDialog: FunctionComponent<{
  resolve: { offering; offeringRequestMode };
}> = ({ resolve: { offering, offeringRequestMode } }) => {
  const { openDialog, closeDialog } = useModal();
  const customer = useSelector(getCustomer);
  const user = useUser();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      closeDialog();
      openDialog(IssueCreateDialog, {
        resolve: {
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request {mode} of public offering', {
              mode: offeringRequestMode,
            }),
            description:
              offeringRequestMode === 'publishing'
                ? translate(
                    // eslint-disable-next-line waldur-custom/no-template-in-translate
                    'Please review and activate offering {offeringName} ({offeringUuid}). \n' +
                      'Requestor: {userName} / {userUuid}. \n' +
                      'Service provider: {customerName} / {customerUuid}',
                    {
                      offeringName: offering.name,
                      offeringUuid: offering.uuid,
                      userName: user.full_name,
                      userUuid: user.uuid,
                      customerName: customer.name,
                      customerUuid: customer.uuid,
                    },
                  )
                : translate(
                    // eslint-disable-next-line waldur-custom/no-template-in-translate
                    'Please open offering {offeringName} ({offeringUuid}) for editing. \n' +
                      'Requestor: {userName} / {userUuid}. \n' +
                      'Service provider: {customerName} / {customerUuid}',
                    {
                      offeringName: offering.name,
                      offeringUuid: offering.uuid,
                      userName: user.full_name,
                      userUuid: user.uuid,
                      customerName: customer.name,
                      customerUuid: customer.uuid,
                    },
                  ),
            resource: {
              ...offering,
              url: undefined,
            },
            offeringRequestMode,
          },
          options: {
            title: translate('Request {mode} of public offering', {
              mode: offeringRequestMode,
            }),
            descriptionPlaceholder: translate('Please provide a reason'),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
        },
        dialogClassName: 'modal-dialog-centered mw-650px',
        formId: ISSUE_CREATION_FORM_ID,
      });
    }
  }, [closeDialog, openDialog, offering, offeringRequestMode, customer, user]);

  return (
    <ModalDialog
      title={translate('Request {mode} of {name}', {
        name: offering.name,
        mode: offeringRequestMode,
      })}
      footer={<CloseDialogButton label={translate('Ok')} />}
    >
      <p>
        {translate(
          'Please note that request should specify offering and provide a reason.',
        )}
      </p>
    </ModalDialog>
  );
};
