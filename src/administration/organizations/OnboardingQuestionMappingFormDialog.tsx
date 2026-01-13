import { useQuery } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  checklistsAdminQuestionsList,
  onboardingQuestionMetadataCreate,
  onboardingQuestionMetadataUpdate,
  OnboardingQuestionMetadata,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OnboardingQuestionMappingFormDialogProps {
  resolve: {
    mapping?: OnboardingQuestionMetadata;
    refetch: () => void;
  };
}

interface FormData {
  question: string;
  maps_to_customer_field?: string;
  intent_field?: string;
}

export const OnboardingQuestionMappingFormDialog: FC<
  OnboardingQuestionMappingFormDialogProps
> = ({ resolve: { mapping, refetch } }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(mapping);

  const {
    data: onboardingQuestions,
    isLoading,
    error,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['ChecklistQuestions'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminQuestionsList({
          query: {
            page_size: MAX_PAGE_SIZE,
            page,
            checklist_type: 'customer_onboarding',
            has_onboarding_mapping: false,
          } as any,
        }),
      ),
    // Disable caching to always fetch the latest questions after opening the dialog
    staleTime: 0,
  });

  const initialValues: FormData = mapping
    ? {
        question: mapping.question,
        maps_to_customer_field: mapping.maps_to_customer_field || '',
        intent_field: mapping.intent_field || '',
      }
    : {
        question: '',
        maps_to_customer_field: '',
        intent_field: '',
      };

  const handleSubmit = async (formData: FormData) => {
    // Validate that at least one field is filled
    if (!formData.maps_to_customer_field && !formData.intent_field) {
      return {
        [FORM_ERROR]: translate(
          'Please fill at least one field (Customer field or Intent field) to complete the mapping for the selected question. Unmapped questions will not appear in the organization create form.',
        ),
      };
    }

    try {
      if (isEdit) {
        await onboardingQuestionMetadataUpdate({
          path: { uuid: mapping.uuid },
          body: {
            question: mapping.question,
            maps_to_customer_field: formData.maps_to_customer_field || '',
            intent_field: formData.intent_field || '',
          },
        });
        dispatch(showSuccess(translate('Question mapping has been updated.')));
      } else {
        await onboardingQuestionMetadataCreate({
          body: {
            question: formData.question,
            maps_to_customer_field:
              formData.maps_to_customer_field || undefined,
            intent_field: formData.intent_field || undefined,
          },
        });
        dispatch(showSuccess(translate('Question mapping has been created.')));
      }
      dispatch(closeModalDialog());
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to save question mapping.')),
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit} initialValues={initialValues}>
      {({ handleSubmit, submitting, submitError, dirtySinceLastSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit question mapping')
                : translate('Create question mapping')
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={submitError && !dirtySinceLastSubmit}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            {!isLoading && error ? (
              <LoadingErred
                loadData={refetchQuestions}
                message={translate('Unable to load questions.')}
              />
            ) : null}

            {submitError && (
              <div className="alert alert-danger" role="alert">
                {submitError}
              </div>
            )}

            <FormGroup label={translate('Question')} required>
              <Field
                name="question"
                component={SelectField as any}
                options={onboardingQuestions}
                getOptionLabel={(option) => option.description}
                getOptionValue={(option) => option.url}
                noOptionsMessage={() => translate('No questions found')}
                validate={required}
                isLoading={isLoading}
                isDisabled={isEdit}
                simpleValue
              />
            </FormGroup>

            <FormGroup label={translate('Customer field')}>
              <Field
                name="maps_to_customer_field"
                component={StringField as any}
                placeholder="e.g., vat_code"
                description={translate(
                  "Customer model field name to map this answer to (e.g., 'registration_code', 'email', 'vat_code'). Leave empty if this is an intent field.",
                )}
              />
            </FormGroup>

            <FormGroup label={translate('Intent field')}>
              <Field
                name="intent_field"
                component={StringField as any}
                placeholder="e.g., intent"
                description={translate(
                  "Type of intent/purpose field (e.g., 'intent', 'registration_purpose'). This stays with verification metadata. Leave empty if this is a customer field.",
                )}
              />
            </FormGroup>

            <div className="alert alert-info">
              <strong>{translate('Note:')}</strong>{' '}
              {translate(
                'Use maps_to_customer_field for data that saves to Customer model, or intent_field for data that stays with verification.',
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
