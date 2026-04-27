import { useEffect, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { openIssueCreateDialog } from '@/issues/create/actions';
import { ISSUE_IDS } from '@/issues/types/constants';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { getCustomer, getUser } from '@/workspace/selectors';

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
