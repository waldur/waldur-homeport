import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Field, Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SubmitButton, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CountrySelectField } from '@/form/CountrySelectField';
import { DateField } from '@/form/DateField';
import { MultiCountrySelectField } from '@/form/MultiCountrySelectField';
import { PhoneNumberField } from '@/form/PhoneNumberField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { EditUserProps } from '../types';

import {
  GenderSelectField,
  OrganizationTypeSelectField,
  PersonalTitleSelectField,
} from './fields';
import { useProfileFieldWarnings } from './useProfileFieldWarnings';
import { useUpdateUser } from './useUpdateUser';

// Fields that use CountrySelectField
const COUNTRY_FIELDS = [
  'country_of_residence',
  'nationality',
  'organization_country',
];

// Fields that use MultiCountrySelectField
const MULTI_COUNTRY_FIELDS = ['nationalities'];

interface EditFieldDialogProps {
  resolve: EditUserProps;
}

export const EditFieldDialog: React.FC<EditFieldDialogProps> = ({
  resolve,
}) => {
  const { closeDialog, confirm } = useModal();

  const { callback } = useUpdateUser(resolve.user);
  const { data: fieldWarnings } = useProfileFieldWarnings();

  const processRequest = useCallback(
    async (values) => {
      try {
        const newValue = values[resolve.name];
        const isEmpty =
          newValue === '' ||
          newValue === null ||
          newValue === undefined ||
          (Array.isArray(newValue) && newValue.length === 0);

        if (isEmpty && fieldWarnings) {
          const offerings = fieldWarnings[resolve.name];
          if (offerings?.length) {
            const offeringNames = offerings
              .map((o) => o.offering_name)
              .join(', ');
            try {
              await confirm(
                translate('Field required by offerings'),
                translate(
                  '"{field}" is required by: {offerings}. Without it, service providers will not be able to see your user account.',
                  {
                    field: resolve.label,
                    offerings: offeringNames,
                  },
                ),
                {
                  positiveButton: translate('Clear anyway'),
                  positiveButtonVariant: 'warning',
                  negativeButton: translate('Cancel'),
                },
              );
            } catch {
              return;
            }
          }
        }

        await callback(values);
        closeDialog();
      } catch (e) {
        if (e.response && e.response.status === 400) {
          return e.response.data;
        }
      }
    },
    [resolve, fieldWarnings],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={pick(resolve.user, resolve.name)}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />

                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Submit')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {resolve.name === 'notifications_enabled' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="notifications_enabled"
                  component={AwesomeCheckboxField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name === 'description' ? (
              <FormGroup
                label={translate('Description')}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="description"
                  component={TextField}
                  validate={resolve.requiredMsg ? required : undefined}
                  maxLength={500}
                  spaceless
                />
              </FormGroup>
            ) : resolve.name === 'gender' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="gender"
                  component={GenderSelectField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name === 'personal_title' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="personal_title"
                  component={PersonalTitleSelectField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name === 'organization_type' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="organization_type"
                  component={OrganizationTypeSelectField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name === 'birth_date' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="birth_date"
                  component={DateField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : COUNTRY_FIELDS.includes(resolve.name) ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name={resolve.name}
                  component={CountrySelectField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : MULTI_COUNTRY_FIELDS.includes(resolve.name) ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name={resolve.name}
                  component={MultiCountrySelectField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name === 'phone_number' ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
                description={translate(
                  'International format with country code, e.g. +1 202 555 1234',
                )}
              >
                <Field
                  name="phone_number"
                  component={PhoneNumberField}
                  validate={resolve.requiredMsg ? required : undefined}
                />
              </FormGroup>
            ) : resolve.name ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name={resolve.name}
                  component={StringField}
                  validate={resolve.requiredMsg ? required : undefined}
                  spaceless
                />
              </FormGroup>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
