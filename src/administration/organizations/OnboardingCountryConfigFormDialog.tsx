import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  checklistsAdminList,
  onboardingCountryConfigsCreate,
  onboardingCountryConfigsUpdate,
  OnboardingCountryChecklistConfiguration,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, StringField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OnboardingCountryConfigFormDialogProps {
  resolve: {
    config?: OnboardingCountryChecklistConfiguration;
    refetch: () => void;
  };
}

interface FormData {
  country: string;
  checklist: string;
  is_active: boolean;
}

export const OnboardingCountryConfigFormDialog: FC<
  OnboardingCountryConfigFormDialogProps
> = ({ resolve: { config, refetch } }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(config);

  const {
    data: checklists,
    isLoading,
    error,
    refetch: refetchChecklists,
  } = useQuery({
    queryKey: ['ChecklistsAdmin'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminList({
          query: {
            page_size: 1000,
            page,
            checklist_type: 'customer_onboarding',
          },
        }),
      ),
    staleTime: 3 * 60 * 1000,
  });

  const initialValues: FormData = config
    ? {
        country: config.country,
        checklist: config.checklist,
        is_active: config.is_active ?? true,
      }
    : {
        country: '',
        checklist: '',
        is_active: true,
      };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (isEdit) {
        await onboardingCountryConfigsUpdate({
          path: { uuid: config.uuid },
          body: {
            country: formData.country,
            checklist: formData.checklist,
            is_active: formData.is_active,
          },
        });
        dispatch(
          showSuccess(translate('Country configuration has been updated.')),
        );
      } else {
        await onboardingCountryConfigsCreate({
          body: {
            country: formData.country,
            checklist: formData.checklist,
            is_active: formData.is_active,
          },
        });
        dispatch(
          showSuccess(translate('Country configuration has been created.')),
        );
      }
      dispatch(closeModalDialog());
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to save country configuration.'),
        ),
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit country configuration')
                : translate('Create country configuration')
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <FormGroup
              label={translate('Country')}
              description={translate(
                "ISO country code (e.g., 'EE' for Estonia)",
              )}
              required
            >
              <Field
                name="country"
                component={StringField as any}
                validate={required}
                isDisabled={isEdit}
              />
            </FormGroup>

            {!isLoading && error ? (
              <LoadingErred
                loadData={refetchChecklists}
                message={translate('Unable to load checklists.')}
              />
            ) : null}
            <FormGroup label={translate('Checklist')} required>
              <Field
                name="checklist"
                component={SelectField as any}
                options={checklists}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.url}
                noOptionsMessage={() => translate('No checklists found')}
                validate={required}
                isLoading={isLoading}
                simpleValue
              />
            </FormGroup>

            <FormGroup label={translate('Active')}>
              <Field
                name="is_active"
                component={AwesomeCheckboxField as any}
                label={translate(
                  'Enable this configuration for country onboarding',
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
