import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FormCheck } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  nestedReviewerProfileAffiliationsPartialUpdate,
  ReviewerAffiliationRequest,
  AffiliationTypeEnum,
  nestedReviewerProfileAffiliationsCreate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import {
  FormGroup,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

const AFFILIATION_TYPE_OPTIONS = [
  { value: 'employment', label: translate('Employment') },
  { value: 'education', label: translate('Education') },
  { value: 'visiting', label: translate('Visiting') },
  { value: 'honorary', label: translate('Honorary') },
  { value: 'consulting', label: translate('Consulting') },
];

interface AffiliationFormDialogProps {
  resolve: {
    profile: { uuid: string };
    refetch: () => void;
    affiliation?: any;
  };
}

export const AffiliationFormDialog = ({
  resolve,
}: AffiliationFormDialogProps) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const isEdit = Boolean(resolve.affiliation);

  const initialValues = isEdit
    ? {
        organization_name: resolve.affiliation.organization_name,
        organization_identifier: resolve.affiliation.organization_identifier,
        department: resolve.affiliation.department,
        position_title: resolve.affiliation.position_title,
        start_date: resolve.affiliation.start_date,
        end_date: resolve.affiliation.end_date,
        is_primary: resolve.affiliation.is_primary,
        affiliation_type: AFFILIATION_TYPE_OPTIONS.find(
          (opt) => opt.value === resolve.affiliation.affiliation_type,
        ),
      }
    : {
        affiliation_type: AFFILIATION_TYPE_OPTIONS[0],
      };

  const onSubmit = async (formValues) => {
    try {
      const body: ReviewerAffiliationRequest = {
        organization_name: formValues.organization_name,
        organization_identifier:
          formValues.organization_identifier || undefined,
        department: formValues.department || undefined,
        position_title: formValues.position_title,
        start_date: formValues.start_date,
        end_date: formValues.end_date || null,
        is_primary: formValues.is_primary || false,
        affiliation_type: formValues.affiliation_type
          ?.value as AffiliationTypeEnum,
      };

      if (isEdit) {
        // Update existing affiliation
        await nestedReviewerProfileAffiliationsPartialUpdate({
          path: {
            reviewer_profile_uuid: resolve.profile.uuid,
            uuid: resolve.affiliation.uuid,
          },
          body,
        });
        showSuccess(translate('Affiliation has been updated.'));
      } else {
        // Create new affiliation
        await nestedReviewerProfileAffiliationsCreate({
          path: { reviewer_profile_uuid: resolve.profile.uuid },
          body,
        });
        showSuccess(translate('Affiliation has been added.'));
      }

      closeDialog();
      await resolve.refetch();
    } catch (error) {
      showErrorResponse(
        error,
        isEdit
          ? translate('Unable to update affiliation.')
          : translate('Unable to add affiliation.'),
      );
    }
  };

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit affiliation')
                : translate('Add affiliation')
            }
            subtitle={translate(
              'Add your institutional affiliations for conflict of interest detection.',
            )}
            closeButton
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
              name="organization_name"
              label={translate('Organization name')}
              component={FormGroup as any}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="organization_identifier"
              label={translate('Organization identifier')}
              description={translate(
                'ROR, GRID, or other external identifier (optional)',
              )}
              component={FormGroup as any}
            >
              <StringField />
            </Field>

            <Field
              name="department"
              label={translate('Department')}
              component={FormGroup as any}
            >
              <StringField />
            </Field>

            <Field
              name="position_title"
              label={translate('Position title')}
              component={FormGroup as any}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="affiliation_type"
              label={translate('Affiliation type')}
              component={FormGroup as any}
              options={AFFILIATION_TYPE_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              isClearable={false}
              validate={required}
            >
              <SelectField />
            </Field>

            <Field
              name="start_date"
              label={translate('Start date')}
              component={FormGroup as any}
              validate={required}
            >
              <DateField />
            </Field>

            <Field
              name="end_date"
              label={translate('End date')}
              description={translate('Leave empty for current affiliation')}
              component={FormGroup as any}
            >
              <DateField />
            </Field>

            <Field
              name="is_primary"
              label={translate('Primary affiliation')}
              component={FormGroup as any}
              type="checkbox"
            >
              {({ input }) => (
                <div className="form-check">
                  <FormCheck {...input} type="checkbox" id="is_primary" />
                  <FormCheck.Label htmlFor="is_primary">
                    {translate('This is my primary affiliation')}
                  </FormCheck.Label>
                </div>
              )}
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
