import { useEffect, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const RequestActionDialog: FunctionComponent<{
  resolve: { offering; offeringRequestMode };
}> = ({ resolve: { offering, offeringRequestMode } }) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      closeDialog();
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request {mode} of public offering', {
              mode: offeringRequestMode,
            }),
            description:
              offeringRequestMode === 'publishing'
                ? translate(
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
        }),
      );
    }
  });
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
