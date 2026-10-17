import { FC, useMemo } from 'react';
import {
  matrixTicketDraftsCreateIssue,
  MatrixTicketDraftIssue,
  supportIssuesRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { uploadAttachments } from '@/issues/create/IssueCreateDialog';
import { IssueCreateForm } from '@/issues/create/IssueCreateForm';
import { IssueFormData } from '@/issues/create/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { buildEditResolve } from './buildEditResolve';
import { TicketDraft } from './parseTicketDraft';
import {
  isTicketDraftGone,
  useTicketDraftErrorToast,
} from './ticketDraftErrors';

interface TicketDraftEditDialogProps {
  resolve: {
    draft: TicketDraft;
    onCreated(issue: MatrixTicketDraftIssue): void;
    /** Waldur refused the ticket; the card updates from what it says. */
    onFailed(error: unknown): void;
  };
}

const typeName = (type: IssueFormData['type']): string | undefined =>
  typeof type === 'string' ? type : type?.id;

// The draft answers with the issue's page in homeport, and an attachment
// needs its API URL.
const attachFiles = async (issueUuid: string, files?: FileList) => {
  if (!files || files.length === 0) return;
  const { data: issue } = await supportIssuesRetrieve({
    path: { uuid: issueUuid },
  });
  await uploadAttachments(issue.url, files);
};

/**
 * The support request form, prefilled from a chat ticket draft. It creates
 * the ticket through the draft, so the bot still reports it in the thread.
 */
export const TicketDraftEditDialog: FC<TicketDraftEditDialogProps> = ({
  resolve: { draft, onCreated, onFailed },
}) => {
  const { showSuccess, showError } = useNotify();
  const { closeDialog } = useModal();
  const showFailure = useTicketDraftErrorToast();
  const { mutateAsync, isPending } = useManagedMutation<
    { issue: MatrixTicketDraftIssue; attachmentsFailed: boolean },
    unknown,
    IssueFormData
  >({
    mutationFn: async (formData) => {
      const { data } = await matrixTicketDraftsCreateIssue({
        path: { uuid: draft.draftUuid },
        body: {
          summary: formData.summary,
          description: formData.description,
          type: typeName(formData.type),
          // The form may pick another resource of the project, or none.
          resource_uuid: formData.resource?.uuid ?? null,
        },
      });
      // The ticket exists by now: a failed upload must not read as a
      // failed ticket.
      let attachmentsFailed = false;
      try {
        await attachFiles(data.issue_uuid, formData.files);
      } catch {
        attachmentsFailed = true;
      }
      return { issue: data, attachmentsFailed };
    },
    onSuccess: ({ issue, attachmentsFailed }) => {
      onCreated(issue);
      if (attachmentsFailed) {
        showError(
          translate(
            'Ticket {key} created, but attachments could not be uploaded.',
            { key: issue.issue_key },
          ),
        );
      } else {
        showSuccess(translate('Support ticket created.'));
      }
    },
    onError: (error) => {
      showFailure(error, translate('Unable to create the support ticket.'));
      onFailed(error);
      // Nothing in the form can bring a gone draft back.
      if (isTicketDraftGone(error)) closeDialog();
    },
  });

  // Stable, or the form would reset its values on every render.
  const formResolve = useMemo(() => buildEditResolve(draft), [draft]);

  return (
    <IssueCreateForm
      onCreateIssue={mutateAsync}
      resolve={formResolve}
      submitting={isPending}
    />
  );
};
