import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Field, Form } from 'react-final-form';

import { required } from '@/core/validators';
import {
  SubmitButton,
  BooleanGroup,
  TextGroup,
  DateGroup,
  CountrySelectGroup,
  StringGroup,
  SelectGroup,
} from '@/form';
import { MultiCountrySelectField } from '@/form/MultiCountrySelectField';
import { PhoneNumberField } from '@/form/PhoneNumberField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { EditUserProps } from '../types';

import {
  getGenderChoices,
  getOrganizationTypeOptions,
  getPersonalTitleOptions,
} from './aai-constants';
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
              <BooleanGroup
                name="notifications_enabled"
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              />
            ) : resolve.name === 'description' ? (
              <TextGroup
                name="description"
                validate={resolve.requiredMsg ? required : undefined}
                maxLength={500}
                spaceless
                label={translate('Description')}
                required={Boolean(resolve.requiredMsg)}
              />
            ) : resolve.name === 'gender' ? (
              <SelectGroup
                name="gender"
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
                options={getGenderChoices()}
                isClearable={true}
                simpleValue={true}
              />
            ) : resolve.name === 'personal_title' ? (
              <SelectGroup
                name="personal_title"
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
                options={getPersonalTitleOptions()}
                isClearable={true}
                simpleValue={true}
              />
            ) : resolve.name === 'organization_type' ? (
              <SelectGroup
                name="organization_type"
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
                options={getOrganizationTypeOptions()}
                isClearable={true}
                simpleValue={true}
              />
            ) : resolve.name === 'birth_date' ? (
              <DateGroup
                name="birth_date"
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              />
            ) : COUNTRY_FIELDS.includes(resolve.name) ? (
              <CountrySelectGroup
                name={resolve.name}
                validate={resolve.requiredMsg ? required : undefined}
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              />
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
              <StringGroup
                name={resolve.name}
                validate={resolve.requiredMsg ? required : undefined}
                spaceless
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              />
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
