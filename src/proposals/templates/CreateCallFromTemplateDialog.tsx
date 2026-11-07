import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useEffect, useRef, useState } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import {
  CallImportResponse,
  CallTemplate,
  callTemplatesList,
  proposalProtectedCallsImportCall,
} from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { RadioGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ImportCallResult } from '@/proposals/transfer/ImportCallDialog';

import { originOwner } from './CallTemplateOrigin';
import { CallTemplateStepsPreview } from './CallTemplateStepsPreview';

interface CreateCallFromTemplateDialogProps {
  resolve: {
    managerUuid: string;
    refetch?(): void;
  };
}

interface FormValues {
  template?: string;
  name?: string;
}

const callTemplatesQueryKey = ['call-templates', 'published'];

/**
 * Names the call after the chosen template until the user types a name of
 * their own.
 */
const NameFromTemplate: FC<{ templates: CallTemplate[] }> = ({ templates }) => {
  const form = useForm<FormValues>();
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const suggested = useRef<string | undefined>(undefined);
  useEffect(() => {
    const template = templates.find((t) => t.uuid === values.template);
    if (!template) return;
    if (!values.name || values.name === suggested.current) {
      suggested.current = template.name;
      form.change('name', template.name);
    }
    // Only a change of template renames the call; typing a name does not
    // rerun this.
  }, [values.template, templates, form]);
  return null;
};

const SelectedTemplatePreview: FC<{ templates: CallTemplate[] }> = ({
  templates,
}) => {
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const template = templates.find((t) => t.uuid === values.template);
  if (!template) return null;
  return (
    <div className="mt-3">
      <CallTemplateStepsPreview
        steps={template.steps}
        templateUuid={template.uuid}
      />
    </div>
  );
};

export const CreateCallFromTemplateDialog: FC<
  CreateCallFromTemplateDialogProps
> = ({ resolve }) => {
  const router = useRouter();
  const { closeDialog } = useModal();
  const [result, setResult] = useState<CallImportResponse | null>(null);

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: callTemplatesQueryKey,
    queryFn: () =>
      callTemplatesList({ query: { o: ['name'], page_size: 100 } }).then(
        (response) => response.data,
      ),
  });

  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const response = await proposalProtectedCallsImportCall({
        body: {
          manager: resolve.managerUuid,
          template: values.template,
          name: values.name,
        },
      });
      return response.data;
    },
    // Warnings have to be read before the dialog goes away.
    closeModal: false,
    refetch: resolve.refetch,
    onSuccess: (data) => {
      if (data.warnings.length) {
        setResult(data);
        return;
      }
      closeDialog();
      router.stateService.go('protected-call.main', {
        call_uuid: data.call_uuid,
      });
    },
    successMessage: translate('Call created as a draft.'),
  });

  if (result) {
    return <ImportCallResult result={result} />;
  }

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create call from template')}
            subtitle={translate(
              'The call starts as a draft with the settings and workflow of the template. Add its rounds, offerings and team afterwards.',
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
                    label={translate('Create')}
                    invalid={invalid || !templates?.length}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                loadData={refetch}
                message={translate('Unable to load call templates.')}
              />
            ) : !templates?.length ? (
              <NoResult
                title={translate('No call templates yet')}
                message={translate(
                  'Staff publish call templates; until then, start from a blank call or import a call file.',
                )}
                buttonTitle={translate('Close')}
                callback={closeDialog}
              />
            ) : (
              <>
                <NameFromTemplate templates={templates} />
                <RadioGroup
                  name="template"
                  label={translate('Template')}
                  required
                  validate={required}
                  options={templates.map((template) => ({
                    value: template.uuid,
                    label:
                      template.is_published !== false ? (
                        template.name
                      ) : (
                        <>
                          {template.name}{' '}
                          <Badge variant="warning" tone="outline">
                            {translate('Unpublished')}
                          </Badge>
                        </>
                      ),
                    description:
                      template.origin || template.description ? (
                        <>
                          {template.origin ? (
                            <span
                              className="block"
                              data-testid="call-template-origin"
                            >
                              {originOwner(template.origin)
                                ? `${originOwner(template.origin)} · ${template.origin.process}`
                                : template.origin.process}
                            </span>
                          ) : null}
                          {template.description || null}
                        </>
                      ) : undefined,
                  }))}
                />
                <StringGroup
                  name="name"
                  validate={required}
                  label={translate('Call name')}
                  required
                />
                <SelectedTemplatePreview templates={templates} />
              </>
            )}

            {mutation.error && (
              <AlertItem
                variant="error"
                type="floating"
                className="mt-3"
                title={translate('Unable to create call.')}
                body={format(mutation.error)}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
