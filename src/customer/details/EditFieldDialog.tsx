import { useQuery } from '@tanstack/react-query';
import { pick } from 'lodash';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SelectField, SubmitButton, TextField } from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { getAllOrganizationGroups } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { EDIT_CUSTOMER_FORM_ID } from './constants';
import { EditCustomerProps } from './types';

type FormData = Record<string, any>;

export const EditFieldDialog = connect<{}, {}, { resolve: EditCustomerProps }>(
  (_, ownProps) => ({
    initialValues: pick(ownProps.resolve.customer, ownProps.resolve.name),
  }),
)(
  reduxForm<FormData, { resolve: EditCustomerProps }>({
    form: EDIT_CUSTOMER_FORM_ID,
  })((props) => {
    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return props.resolve
          .callback(values, dispatch)
          .then(() => {
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve.callback],
    );

    const {
      isLoading: groupsLoading,
      error: groupsError,
      data: organizationGroups,
      refetch: refetchGroups,
    } = useQuery(
      ['organizationGroups'],
      () =>
        getAllOrganizationGroups().then((items) => {
          return items.map((item) => ({
            name: [item.parent_name, item.name].filter(Boolean).join(' ➔ '),
            value: item.url,
          }));
        }),
      { staleTime: 5 * 60 * 1000 },
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          headerLess
          bodyClassName="pb-2"
          footerClassName="border-0 pt-0 gap-2"
          footer={
            <>
              <CloseDialogButton className="flex-grow-1" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-grow-1"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {props.resolve.name === 'name' ? (
              <StringField name="name" label={translate('Name')} />
            ) : props.resolve.name === 'native_name' ? (
              <StringField
                name="native_name"
                label={translate('Native name')}
              />
            ) : props.resolve.name === 'abbreviation' ? (
              <StringField
                name="abbreviation"
                label={translate('Abbreviation')}
              />
            ) : props.resolve.name === 'organization_group' ? (
              groupsLoading ? (
                <LoadingSpinner />
              ) : groupsError ? (
                <LoadingErred
                  loadData={refetchGroups}
                  message={translate('Unable to load organization groups.')}
                />
              ) : (
                <SelectField
                  name="organization_group"
                  label={translate('Organization group')}
                  options={organizationGroups}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.value}
                  simpleValue
                  floating={false}
                />
              )
            ) : props.resolve.name === 'domain' ? (
              <StringField
                name="domain"
                label={translate('Domain name')}
                description={translate('Home organization domain name')}
              />
            ) : props.resolve.name === 'address' ? (
              <StringField name="address" label={translate('Address')} />
            ) : props.resolve.name === 'access_subnets' ? (
              <StringField
                name="access_subnets"
                label={translate('Subnets')}
                description={translate(
                  'Subnets from where connection to self-service is allowed.',
                )}
              />
            ) : props.resolve.name === 'postal' ? (
              <StringField name="postal" label={translate('Postal code')} />
            ) : props.resolve.name === 'uuid' ? (
              <StringField name="uuid" label={translate('UUID')} disabled />
            ) : props.resolve.name === 'registration_code' ? (
              <StringField
                name="registration_code"
                label={translate('Registration code')}
              />
            ) : props.resolve.name === 'agreement_number' ? (
              <StringField
                name="agreement_number"
                label={translate('Agreement number')}
              />
            ) : props.resolve.name === 'sponsor_number' ? (
              <StringField
                name="sponsor_number"
                label={translate('Sponsor number')}
              />
            ) : props.resolve.name === 'slug' ? (
              <StringField name="slug" label={translate('Slug')} />
            ) : // Contact fields
            props.resolve.name === 'email' ? (
              <EmailField name="email" label={translate('Email')} />
            ) : props.resolve.name === 'phone_number' ? (
              <StringField
                name="phone_number"
                label={translate('Phone number')}
              />
            ) : props.resolve.name === 'contact_details' ? (
              <TextField
                name="contact_details"
                label={translate('Contact details')}
              />
            ) : props.resolve.name === 'homepage' ? (
              <StringField name="homepage" label={translate('Homepage')} />
            ) : null}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
