import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CountrySelectField } from '@waldur/form/CountrySelectField';
import { MultiCountrySelectField } from '@waldur/form/MultiCountrySelectField';
import { PhoneNumberField } from '@waldur/form/PhoneNumberField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { EditUserProps } from '../types';

import {
  GenderSelectField,
  OrganizationTypeSelectField,
  PersonalTitleSelectField,
} from './fields';
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
  const dispatch = useDispatch();
  const { callback } = useUpdateUser(resolve.user);

  const processRequest = useCallback(
    async (values) => {
      try {
        await callback(values);
        dispatch(closeModalDialog());
      } catch (e) {
        if (e.response && e.response.status === 400) {
          return e.response.data;
        }
      }
    },
    [resolve, dispatch],
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
                  component={AwesomeCheckboxField as any}
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
                  component={TextField as any}
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
                  component={GenderSelectField as any}
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
                  component={PersonalTitleSelectField as any}
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
                  component={OrganizationTypeSelectField as any}
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
                  component={CountrySelectField as any}
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
                  component={MultiCountrySelectField as any}
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
                  component={PhoneNumberField as any}
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
                  component={StringField as any}
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
