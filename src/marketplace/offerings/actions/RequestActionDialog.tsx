import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch, useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { IssueCreateDialog } from '@waldur/issues/create/IssueCreateDialog';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const RequestActionDialog = ({
  resolve: { offering, offeringRequestMode },
  close,
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  React.useEffect(() => {
    if (isFeatureVisible('support')) {
      close();
      dispatch(
        openModalDialog(IssueCreateDialog, {
          resolve: {
            issue: {
              type: ISSUE_IDS.SERVICE_REQUEST,
              summary: translate('Request {mode} of Public Offering', {
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
              title: translate('Request {mode} of Public Offering', {
                mode: offeringRequestMode,
              }),
              descriptionPlaceholder: translate('Please provide a reason'),
              descriptionLabel: translate('Description'),
              hideTitle: true,
            },
          },
        }),
      );
    }
  });
  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {translate('Request {mode} of {name}', {
            name: offering.name,
            mode: offeringRequestMode,
          })}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>
          {translate(
            'Please note that request should specify offering and provide a reason.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
