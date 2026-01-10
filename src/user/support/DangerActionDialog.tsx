import { TrashIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { IssueTypeEnum, supportIssuesCreate } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { DangerActionPanelProps } from './DangerActionPanelProps';

export const DangerActionDialog: FunctionComponent<DangerActionPanelProps> = (
  props,
) => {
  const router = useRouter();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [reason, setReason] = useState('');
  const handleSubmit = async () => {
    try {
      const issue = await supportIssuesCreate({
        body: {
          type: ISSUE_IDS.CHANGE_REQUEST as IssueTypeEnum,
          description: reason,
          summary: props.issueSummary,
          is_reported_manually: true,
          resource: props.resource ? props.resource.name : undefined,
        },
      }).then((response) => response.data);
      showSuccess(props.sucessMessage);
      router.stateService.go('support.detail', { issue_uuid: issue.uuid });
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to create request.'));
    }
  };

  return ENV.plugins.WALDUR_SUPPORT.ENABLED ? (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <ModalDialog
        title={props.dialogTitle}
        subtitle={props.dialogSubtitle}
        iconNode={<TrashIcon weight="bold" />}
        iconColor="danger"
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              submitting={false}
              variant="danger"
              className="flex-equal"
              label={translate('Delete')}
            />
          </>
        }
      >
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Form.Group>
      </ModalDialog>
    </form>
  ) : (
    <ModalDialog
      title={props.dialogTitle}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      bodyClassName="text-quaternary fs-6"
      footer={<CloseDialogButton label={translate('OK')} />}
    >
      {props.fallbackMessage}
    </ModalDialog>
  );
};
