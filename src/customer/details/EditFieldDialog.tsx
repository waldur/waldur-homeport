import { useQuery } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import { organizationGroupsList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { NumberField, SelectField, SubmitButton, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { DateField } from '@/form/DateField';
import { EmailField } from '@/form/EmailField';
import { FormContainer } from '@/form/FormContainer';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { SelectCountryField } from '../list/SelectCountryField';

import { EDIT_CUSTOMER_FORM_ID } from './constants';
import { EditCustomerProps } from './types';

type FormData = Record<string, any>;

export const EditFieldDialog = connect<{}, {}, { resolve: EditCustomerProps }>(
  (_, ownProps) => ({
    initialValues: {
      ...(ownProps.resolve.name === 'country'
        ? {
            // @ts-ignore
            country: ownProps.resolve.customer.country
              ? {
                  // @ts-ignore
                  value: ownProps.resolve.customer.country,
                  // @ts-ignore
                  label: ownProps.resolve.customer.country_name,
                }
              : null,
          }
        : pick(ownProps.resolve.customer, ownProps.resolve.name)),
    },
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
    } = useQuery({
      queryKey: ['organizationGroups'],

      queryFn: () =>
        getAllPages((page) => organizationGroupsList({ query: { page } })).then(
          (items) =>
            items.map((item) => ({
              name: [item.parent_name, item.name].filter(Boolean).join(' ➔ '),
              value: item.url,
            })),
        ),

      staleTime: STALE_TIME,
    });

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          headerLess
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
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
            ) : props.resolve.name === 'description' ? (
              <TextField name="description" label={translate('Description')} />
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
            ) : props.resolve.name === 'city' ? (
              <StringField name="city" label={translate('City')} />
            ) : props.resolve.name === 'state' ? (
              <StringField name="state" label={translate('State')} />
            ) : props.resolve.name === 'parish' ? (
              <StringField name="parish" label={translate('Parish')} />
            ) : props.resolve.name === 'street' ? (
              <StringField name="street" label={translate('Street')} />
            ) : props.resolve.name === 'house_nr' ? (
              <StringField name="house_nr" label={translate('House number')} />
            ) : props.resolve.name === 'apartment_nr' ? (
              <StringField
                name="apartment_nr"
                label={translate('Apartment number')}
              />
            ) : props.resolve.name === 'household' ? (
              <StringField name="household" label={translate('Household')} />
            ) : props.resolve.name === 'country' ? (
              <SelectCountryField />
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
              <StringField
                name="slug"
                label={translate('Slug')}
                description={translate(
                  'Warning: Changing the slug may break external integrations that rely on this value. Ensure that all dependent systems are updated before proceeding.',
                )}
              />
            ) : props.resolve.name === 'max_service_accounts' ? (
              <NumberField
                name="max_service_accounts"
                label={translate('Maximum number of service accounts')}
                min={0}
              />
            ) : props.resolve.name === 'display_billing_info_in_projects' ? (
              <AwesomeCheckboxField
                name={props.resolve.name}
                label={translate('Display billing info in projects')}
                hideLabel
                alignMiddle
              />
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
            ) : props.resolve.name === 'notification_emails' ? (
              <CommaSeparatedListField
                name="notification_emails"
                label={translate('Notification emails')}
                placeholder={translate(
                  'Enter email addresses separated by commas',
                )}
                description={translate(
                  'Email addresses for receiving notifications, separated by commas',
                )}
              />
            ) : props.resolve.name === 'allowed_domains' ? (
              <CommaSeparatedListField
                name="allowed_domains"
                label={translate('Allowed domains')}
                placeholder={translate('Enter domains separated by commas')}
                description={translate(
                  'List of allowed domains for offering endpoints.',
                )}
              />
            ) : // Service provider
            props.resolve.name === 'description' ? (
              <TextField name="description" label={translate('Description')} />
            ) : // Billing details
            props.resolve.name === 'accounting_start_date' ? (
              <DateField
                name="accounting_start_date"
                label={translate('Accounting start date')}
              />
            ) : props.resolve.name === 'bank_name' &&
              isFeatureVisible(CustomerFeatures.show_banking_data) ? (
              <StringField name="bank_name" label={translate('Bank name')} />
            ) : props.resolve.name === 'bank_account' &&
              isFeatureVisible(CustomerFeatures.show_banking_data) ? (
              <StringField
                name="bank_account"
                label={translate('Bank account')}
              />
            ) : // Billing tax
            props.resolve.name === 'vat_code' ? (
              <StringField name="vat_code" label={translate('VAT code')} />
            ) : props.resolve.name === 'default_tax_percent' ? (
              <NumberField
                name="default_tax_percent"
                label={translate('Tax percentage')}
                unit="%"
                min={0}
                max={200}
              />
            ) : props.resolve.name === 'grace_period_days' ? (
              <NumberField
                name="grace_period_days"
                label={translate('Grace period (days)')}
                description={translate(
                  'Number of extra days after project end date before resources are terminated',
                )}
                min={0}
              />
            ) : props.resolve.name === 'project_slug_template' ? (
              <StringField
                name="project_slug_template"
                label={translate('Project slug template')}
                description={translate(
                  'Placeholders: {customer_slug}, {project_name}, {year}, {month}, {counter}, {counter_padded}. Leave empty for default name-based slug.',
                )}
              />
            ) : null}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
