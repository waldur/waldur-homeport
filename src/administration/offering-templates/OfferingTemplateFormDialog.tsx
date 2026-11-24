import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingTemplatesCreate,
  marketplaceOfferingTemplatesPartialUpdate,
  OfferingTemplate,
  OfferingTemplateRequest,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { OfferingTemplateDocumentField } from './OfferingTemplateDocumentField';
import { documentToText, toSubmitErrors } from './templateDocument';

interface OfferingTemplateFormDialogProps {
  resolve: {
    /** The template to edit; a new one is created without it. */
    template?: OfferingTemplate;
    refetch?(): void;
  };
}

interface FormValues {
  name: string;
  description?: string;
  offering_type: string;
  is_published?: boolean;
  document: string;
}

const FIELDS = [
  'name',
  'description',
  'offering_type',
  'is_published',
  'document',
];

export const OfferingTemplateFormDialog: FC<
  OfferingTemplateFormDialogProps
> = ({ resolve: { template, refetch } }) => {
  const isEdit = Boolean(template);
  const initialValues = useMemo<FormValues>(
    () =>
      template
        ? {
            name: template.name,
            description: template.description ?? '',
            offering_type: template.offering_type,
            is_published: Boolean(template.is_published),
            document: documentToText(template.document),
          }
        : {
            name: '',
            description: '',
            offering_type: SITE_AGENT_PLUGIN,
            is_published: false,
            document: '',
          },
    [template],
  );
  const offeringTypeOptions = useMemo(
    () => [{ value: SITE_AGENT_PLUGIN, label: getLabel(SITE_AGENT_PLUGIN) }],
    [],
  );

  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const body = {
        name: values.name,
        description: values.description ?? '',
        offering_type: values.offering_type,
        is_published: Boolean(values.is_published),
      };
      // The API takes the document as a mapping or as YAML text, and JSON is
      // YAML: the text goes as it was typed, so the server alone decides how
      // it reads. Left as it was, it is not sent, and the version stays.
      const document =
        values.document as unknown as OfferingTemplateRequest['document'];
      const response = isEdit
        ? await marketplaceOfferingTemplatesPartialUpdate({
            path: { uuid: template.uuid },
            body:
              values.document === initialValues.document
                ? body
                : { ...body, document },
          })
        : await marketplaceOfferingTemplatesCreate({
            body: { ...body, document },
          });
      return response.data;
    },
    refetch,
    successMessage: isEdit
      ? translate('Offering template updated.')
      : translate('Offering template created.'),
  });

  return (
    <Form<FormValues>
      onSubmit={(values) =>
        mutation
          .mutateAsync(values)
          .then(() => undefined)
          .catch((error) => toSubmitErrors(error, FIELDS, values.document))
      }
      initialValues={initialValues}
      render={({
        handleSubmit,
        submitting,
        invalid,
        submitError,
        dirtySinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit offering template')
                : translate('Add offering template')
            }
            subtitle={translate(
              'An offering template carries an offering, its components, plans and agent configuration, with the parameters a service provider fills in to create an offering from it. Secrets, files, screenshots, organizations and resources are never part of it.',
            )}
            footer={
              <>
                <div className="min-w-dialog-action">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-full"
                  />
                </div>
                <div className="min-w-dialog-action">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    label={isEdit ? translate('Save') : translate('Create')}
                    invalid={invalid}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            {submitError && !dirtySinceLastSubmit ? (
              <AlertItem
                variant="error"
                type="floating"
                className="mb-3"
                title={translate('Unable to save the offering template.')}
                body={submitError}
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
                'Shown to service providers choosing a template.',
              )}
              rows={3}
            />
            <SelectGroup
              name="offering_type"
              label={translate('Offering type')}
              description={translate(
                'The type of the offerings created from the template.',
              )}
              options={offeringTypeOptions}
              simpleValue
              isClearable={false}
              required
              validate={required}
            />
            <BooleanGroup
              name="is_published"
              label={translate('Published')}
              description={translate(
                'Offer the template to every service provider when they create an offering.',
              )}
            />
            <OfferingTemplateDocumentField isEdit={isEdit} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
