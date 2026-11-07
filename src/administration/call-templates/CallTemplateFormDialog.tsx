import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  CallTemplate,
  callTemplatesCreate,
  callTemplatesPartialUpdate,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import {
  BooleanGroup,
  FormGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { toTemplateDocument } from '@/proposals/templates/templateDocument';
import {
  CallFileUpload,
  ParsedCallFile,
} from '@/proposals/transfer/CallFileUpload';

interface CallTemplateFormDialogProps {
  resolve: {
    /** The template to edit; a new one is created without it. */
    template?: CallTemplate;
    refetch?(): void;
  };
}

interface FormValues {
  name: string;
  description?: string;
  is_published?: boolean;
}

const SavedWithWarnings: FC<{ template: CallTemplate }> = ({ template }) => {
  const { closeDialog } = useModal();
  return (
    <ModalDialog
      title={translate('Call template saved')}
      subtitle={translate(
        'A call created from {name} will leave out what this portal does not have:',
        { name: template.name },
      )}
      footer={
        <div className="min-w-[150px]">
          <BaseButton
            variant="primary"
            label={translate('Close')}
            onClick={closeDialog}
            className="w-full"
          />
        </div>
      }
    >
      <ul className="mb-0" data-testid="call-template-warnings">
        {template.warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </ModalDialog>
  );
};

export const CallTemplateFormDialog: FC<CallTemplateFormDialogProps> = ({
  resolve: { template, refetch },
}) => {
  const isEdit = Boolean(template);
  const { closeDialog } = useModal();
  const [parsed, setParsed] = useState<ParsedCallFile | null>(null);
  const [saved, setSaved] = useState<CallTemplate | null>(null);
  const converted = useMemo(
    () => (parsed ? toTemplateDocument(parsed.data) : null),
    [parsed],
  );

  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const body = {
        name: values.name,
        description: values.description ?? '',
        is_published: Boolean(values.is_published),
        ...(converted ? { document: converted.document } : {}),
      };
      const response = isEdit
        ? await callTemplatesPartialUpdate({
            path: { uuid: template.uuid },
            body,
          })
        : await callTemplatesCreate({
            body: { ...body, document: converted.document },
          });
      return response.data;
    },
    // Warnings have to be read before the dialog goes away.
    closeModal: false,
    refetch,
    onSuccess: (data) => {
      if (data.warnings?.length) {
        setSaved(data);
        return;
      }
      closeDialog();
    },
    successMessage: isEdit
      ? translate('Call template updated.')
      : translate('Call template created.'),
  });

  if (saved) {
    return <SavedWithWarnings template={saved} />;
  }

  const fileCallName = (parsed?.data.call as { name?: string } | undefined)
    ?.name;

  return (
    <Form<FormValues>
      key={isEdit ? template.uuid : parsed?.file.name}
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={
        isEdit
          ? {
              name: template.name,
              description: template.description,
              is_published: template.is_published,
            }
          : { name: fileCallName ?? '', is_published: false }
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit call template')
                : translate('Add call template')
            }
            subtitle={translate(
              'A call template carries the settings and workflow of a call: proposal roles, steps, notification rules and the questions of their forms. Rounds, offerings, documents and people are never part of it.',
            )}
            footer={
              <>
                <div className="min-w-[150px]">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-full"
                  />
                </div>
                <div className="min-w-[150px]">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    label={isEdit ? translate('Save') : translate('Create')}
                    invalid={invalid || (!isEdit && !parsed)}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            <FormGroup
              label={
                isEdit ? translate('Replace document') : translate('Document')
              }
              description={
                isEdit
                  ? translate(
                      'Optional. A call export file whose settings and workflow replace those of the template.',
                    )
                  : translate(
                      'A call export file, as Export on a call produces it.',
                    )
              }
              required={!isEdit}
            >
              <CallFileUpload
                value={parsed}
                onChange={setParsed}
                tooLargeMessage={translate(
                  'The file is larger than 2 MB, the most a portal accepts. Export the call again without documents.',
                )}
              />
            </FormGroup>

            {converted?.dropped.length ? (
              <AlertItem
                variant="info"
                type="floating"
                className="mb-3"
                title={translate('Left out of the template: {sections}.', {
                  sections: converted.dropped.join(', '),
                })}
                body={translate(
                  'They belong to one call; a call created from the template starts without them.',
                )}
              />
            ) : null}

            <StringGroup
              name="name"
              validate={required}
              label={translate('Name')}
              required
              maxLength={150}
            />
            <TextGroup
              name="description"
              label={translate('Description')}
              description={translate(
                'Shown to call managers choosing a template.',
              )}
            />
            <BooleanGroup
              name="is_published"
              label={translate('Published')}
              description={translate(
                'Offer the template to every call manager when they create a call.',
              )}
            />

            {mutation.error && (
              <AlertItem
                variant="error"
                type="floating"
                className="mt-3"
                title={translate('Unable to save the call template.')}
                body={format(mutation.error)}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
