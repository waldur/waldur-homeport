import { useEffect, FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const RequestLimitsChangeDialog: FunctionComponent<{
  resolve: { resource };
  close;
}> = ({ resolve: { resource }, close }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT) {
      close();
      dispatch(
        openIssueCreateDialog({
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
        }),
      );
    }
  });
  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {translate('Change of limits of SLURM allocation {name}', {
            name: resource.name,
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
