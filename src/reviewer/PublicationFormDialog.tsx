import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  nestedReviewerProfilePublicationsCreate,
  nestedReviewerProfilePublicationsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  FormGroupFinal,
  NumberField,
  StringField,
  SubmitButton,
  TextField,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface PublicationFormDialogProps {
  resolve: {
    profile: { uuid: string };
    refetch: () => void;
    publication?: any;
  };
}

export const PublicationFormDialog = ({
  resolve,
}: PublicationFormDialogProps) => {
  const isEdit = Boolean(resolve.publication);
  const currentYear = new Date().getFullYear();

  const initialValues = isEdit
    ? {
        title: resolve.publication.title,
        doi: resolve.publication.doi,
        venue: resolve.publication.venue,
        publication_year: resolve.publication.publication_year,
        abstract: resolve.publication.abstract,
      }
    : {
        publication_year: currentYear,
      };

  const publicationMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) => {
      const body = {
        title: formValues.title,
        doi: formValues.doi || null,
        publication_year: formValues.publication_year,
        venue: formValues.venue,
        abstract: formValues.abstract || undefined,
      };
      if (isEdit) {
        return nestedReviewerProfilePublicationsPartialUpdate({
          path: {
            reviewer_profile_uuid: resolve.profile.uuid,
            uuid: resolve.publication.uuid,
          },
          body,
        });
      } else {
        return nestedReviewerProfilePublicationsCreate({
          path: { reviewer_profile_uuid: resolve.profile.uuid },
          body,
        });
      }
    },
    successMessage: isEdit
      ? translate('Publication has been updated.')
      : translate('Publication has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update publication.')
      : translate('Unable to add publication.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => publicationMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit publication')
                : translate('Add publication')
            }
            subtitle={translate(
              'Add publications for co-authorship conflict detection and expertise matching.',
            )}
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor={isEdit ? 'warning' : 'success'}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={isEdit ? translate('Update') : translate('Add')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <Field
              name="title"
              label={translate('Title')}
              component={FormGroupFinal}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="doi"
              label={translate('DOI')}
              description={translate(
                'Digital Object Identifier (e.g., 10.1000/xyz123)',
              )}
              component={FormGroupFinal}
            >
              <StringField />
            </Field>

            <Field
              name="venue"
              label={translate('Venue')}
              description={translate('Journal or conference name')}
              component={FormGroupFinal}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="publication_year"
              label={translate('Publication year')}
              component={FormGroupFinal}
              validate={required}
            >
              <NumberField min={1900} max={currentYear + 1} />
            </Field>

            <Field
              name="abstract"
              label={translate('Abstract')}
              description={translate(
                'Optional abstract for text-based expertise matching',
              )}
              component={FormGroupFinal}
            >
              <TextField rows={4} />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
