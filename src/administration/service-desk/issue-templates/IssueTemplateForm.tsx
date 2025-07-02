import { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import {
  supportTemplatesCreate,
  supportTemplatesCreateAttachments,
  supportTemplatesDeleteAttachments,
  supportTemplatesRetrieve,
  supportTemplatesUpdate,
} from 'waldur-js-client';

import { IssueTemplateTypeOptions } from '@waldur/administration/utils';
import { formDataOptions } from '@waldur/core/api';
import { ACCEPTED_FILE_TYPES } from '@waldur/core/constants';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { Attachment, AttachmentUploading } from '@waldur/form/upload/types';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const IssueTemplateForm = connect<
  {},
  {},
  { resolve: { issueTemplate?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.issueTemplate
    ? { ...ownProps.resolve.issueTemplate }
    : undefined,
}))(
  reduxForm<FormData, { resolve: { issueTemplate?; refetch } }>({
    form: 'AdminIssueTemplateForm',
  })((props) => {
    const dispatch = useDispatch();
    const isEdit = Boolean(props.resolve.issueTemplate?.uuid);

    useEffect(() => {
      if (isEdit && props.resolve.issueTemplate?.attachments) {
        const formattedAttachments =
          props.resolve.issueTemplate.attachments.map((attachment) => ({
            file: attachment.file,
            file_size: attachment.file_size || 0,
            file_name: attachment.file_name || attachment.name,
            mime_type: attachment.mime_type || 'application/octet-stream',
            created: attachment.created || new Date().toISOString(),
            uuid: attachment.uuid,
          }));

        setAttachments(formattedAttachments);
      }
    }, [isEdit, props.resolve.issueTemplate]);

    const [pendingFiles, setPendingFiles] = useState<AttachmentUploading[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const onDrop = (files: File[]) => {
      setPendingFiles((prev) =>
        files
          .map<AttachmentUploading>((f) => ({
            key: f.size,
            file: f,
            name: f.name,
            progress: null,
            error: null,
          }))
          .concat(prev),
      );
    };

    const cancelFile = useCallback(
      (file: File) => {
        setPendingFiles((prev) => prev.filter((f) => f.key !== file.size));
      },
      [setPendingFiles],
    );

    const removeAttachment = useCallback(
      async (attachment: Attachment) => {
        if (!attachment.uuid) {
          cancelFile(attachment.file as File);
          return;
        }

        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'Are you sure you want to remove {doc_name}?',
              { doc_name: <strong>{attachment.file_name}</strong> },
              formatJsxTemplate,
            ),
            { forDeletion: true },
          );
        } catch {
          return;
        }

        try {
          await supportTemplatesDeleteAttachments({
            path: { uuid: props.resolve.issueTemplate.uuid },
            body: { attachment_ids: [attachment.uuid] },
          });
          dispatch(showSuccess(translate('Document has been removed.')));
          props.resolve.refetch();
          setAttachments((prev) =>
            prev.filter((a) => a.uuid !== attachment.uuid),
          );
          const response = await supportTemplatesRetrieve({
            path: { uuid: props.resolve.issueTemplate.uuid },
          });
          reopenEditDialog(response.data, props.resolve.refetch, dispatch);
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to remove document.')),
          );
        }
      },
      [dispatch, props.resolve, cancelFile],
    );

    const attachFiles = async (templateUuid) => {
      if (!pendingFiles.length) return;

      try {
        await Promise.all(
          pendingFiles.map(async (file) => {
            await supportTemplatesCreateAttachments({
              path: { uuid: templateUuid },
              body: {
                attachments: [file.file],
              },
              ...formDataOptions,
            });

            setPendingFiles((prev) => prev.filter((f) => f.key !== file.key));
            setAttachments((prev) => [
              ...prev,
              {
                file: file.file,
                file_size: file.file.size,
                file_name: file.file.name,
                mime_type: file.file.type,
                created: new Date().toISOString(),
              },
            ]);
          }),
        );
        showSuccess(translate('Documents have been attached.'));
      } catch (error) {
        showErrorResponse(
          error,
          translate(
            'An error occurred while attaching documents. Please try again.',
          ),
        );
        throw error;
      }
    };

    const processRequest = useCallback(
      async (values, dispatch) => {
        try {
          const action = isEdit
            ? supportTemplatesUpdate({
                body: values,
                path: { uuid: props.resolve.issueTemplate.uuid },
              })
            : supportTemplatesCreate({ body: values });

          const response = await action;
          const templateUuid = response.data.uuid;

          await attachFiles(templateUuid);
          props.resolve.refetch();
          dispatch(
            showSuccess(
              isEdit
                ? translate('The issue template has been updated.')
                : translate('New issue template has been created.'),
            ),
          );
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              isEdit
                ? translate('Unable to update issue template.')
                : translate('Unable to create issue template.'),
            ),
          );
          if (error.response?.status === 400) {
            throw new SubmissionError(error.response.data);
          }
        }
      },
      [props.resolve, attachFiles],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit the issue template')
              : translate('Create new issue template')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Update') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <StringField label={translate('Name')} name="name" required />
            <SelectField
              label={translate('Type')}
              name="issue_type"
              options={IssueTemplateTypeOptions}
              required
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              simpleValue
              className="col-md-6"
            />

            <TextField
              label={translate('Description')}
              name="description"
              required
            />

            <Form.Label>{translate('Attachments')}</Form.Label>
            <UploadContainer
              onDrop={onDrop}
              message={translate(
                'PDF, PNG, JPG, JPEG, DOCX, DOC or ODT (max. 2 MB)',
              )}
              maxSize={2 * 1024 * 1024} // 2MB
              accept={ACCEPTED_FILE_TYPES}
            />

            <AttachmentsList
              attachments={attachments}
              uploading={pendingFiles}
              className="mb-7"
              ItemComponent={(itemProps) => (
                <AttachmentItem onDelete={removeAttachment} {...itemProps} />
              )}
              ItemPendingComponent={(itemProps) => (
                <AttachmentItemPending {...itemProps} onCancel={cancelFile} />
              )}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);

const reopenEditDialog = (issueTemplate, refetch, dispatch) => {
  dispatch(
    openModalDialog(IssueTemplateForm, {
      dialogClassName: 'modal-dialog-centered',
      resolve: { issueTemplate, refetch },
      size: 'lg',
    }),
  );
};
