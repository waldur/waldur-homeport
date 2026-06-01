import { useQuery } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { organizationGroupsList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import {
  BooleanGroup,
  DateGroup,
  EmailGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
  CommaSeparatedListGroup,
} from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { SelectCountryField } from '../list/SelectCountryField';

import { EditCustomerProps } from './types';

type FormData = Record<string, any>;

export const EditFieldDialog = (props: { resolve: EditCustomerProps }) => {
  const { closeDialog } = useModal();

  const initialValues = useMemo(() => {
    if (props.resolve.name === 'country') {
      return {
        // @ts-ignore
        country: props.resolve.customer.country
          ? {
              // @ts-ignore
              value: props.resolve.customer.country,
              // @ts-ignore
              label: props.resolve.customer.country_name,
            }
          : null,
      };
    }
    return pick(props.resolve.customer, props.resolve.name);
  }, [props.resolve]);

  const processRequest = useCallback(
    (values: FormData) => {
      return props.resolve
        .callback(values)
        .then(() => {
          closeDialog();
        })
        .catch((e) => {
          if (e.response && e.response.status === 400) {
            return e.response.data;
          }
        });
    },
    [props.resolve, closeDialog],
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
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <div className="size-sm">
              {props.resolve.name === 'name' ? (
                <StringGroup
                  name="name"
                  label={translate('Name')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'native_name' ? (
                <StringGroup
                  name="native_name"
                  label={translate('Native name')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'abbreviation' ? (
                <StringGroup
                  name="abbreviation"
                  label={translate('Abbreviation')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'description' ? (
                <TextGroup
                  name="description"
                  label={translate('Description')}
                  disabled={submitting}
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
                  <SelectGroup
                    name="organization_group"
                    label={translate('Organization group')}
                    options={organizationGroups}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.value}
                    simpleValue
                    disabled={submitting}
                  />
                )
              ) : props.resolve.name === 'domain' ? (
                <StringGroup
                  name="domain"
                  label={translate('Domain name')}
                  description={translate('Home organization domain name')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'address' ? (
                <StringGroup
                  name="address"
                  label={translate('Address')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'city' ? (
                <StringGroup
                  name="city"
                  label={translate('City')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'state' ? (
                <StringGroup
                  name="state"
                  label={translate('State')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'parish' ? (
                <StringGroup
                  name="parish"
                  label={translate('Parish')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'street' ? (
                <StringGroup
                  name="street"
                  label={translate('Street')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'house_nr' ? (
                <StringGroup
                  name="house_nr"
                  label={translate('House number')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'apartment_nr' ? (
                <StringGroup
                  name="apartment_nr"
                  label={translate('Apartment number')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'household' ? (
                <StringGroup
                  name="household"
                  label={translate('Household')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'country' ? (
                <SelectCountryField />
              ) : props.resolve.name === 'access_subnets' ? (
                <StringGroup
                  name="access_subnets"
                  label={translate('Subnets')}
                  description={translate(
                    'Subnets from where connection to self-service is allowed.',
                  )}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'postal' ? (
                <StringGroup
                  name="postal"
                  label={translate('Postal code')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'uuid' ? (
                <StringGroup name="uuid" label={translate('UUID')} disabled />
              ) : props.resolve.name === 'registration_code' ? (
                <StringGroup
                  name="registration_code"
                  label={translate('Registration code')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'agreement_number' ? (
                <StringGroup
                  name="agreement_number"
                  label={translate('Agreement number')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'sponsor_number' ? (
                <StringGroup
                  name="sponsor_number"
                  label={translate('Sponsor number')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'slug' ? (
                <StringGroup
                  name="slug"
                  label={translate('Slug')}
                  description={translate(
                    'Warning: Changing the slug may break external integrations that rely on this value. Ensure that all dependent systems are updated before proceeding.',
                  )}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'max_service_accounts' ? (
                <NumberGroup
                  name="max_service_accounts"
                  label={translate('Maximum number of service accounts')}
                  min={0}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'display_billing_info_in_projects' ? (
                <BooleanGroup
                  name={props.resolve.name}
                  label={translate('Display billing info in projects')}
                  hideLabel
                  alignMiddle
                  disabled={submitting}
                />
              ) : // Contact fields
              props.resolve.name === 'email' ? (
                <EmailGroup
                  name="email"
                  label={translate('Email')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'phone_number' ? (
                <StringGroup
                  name="phone_number"
                  label={translate('Phone number')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'contact_details' ? (
                <TextGroup
                  name="contact_details"
                  label={translate('Contact details')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'homepage' ? (
                <StringGroup
                  name="homepage"
                  label={translate('Homepage')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'notification_emails' ? (
                <CommaSeparatedListGroup
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
                <CommaSeparatedListGroup
                  name="allowed_domains"
                  label={translate('Allowed domains')}
                  placeholder={translate('Enter domains separated by commas')}
                  description={translate(
                    'List of allowed domains for offering endpoints.',
                  )}
                />
              ) : // Service provider
              props.resolve.name === 'description' ? (
                <TextGroup
                  name="description"
                  label={translate('Description')}
                  disabled={submitting}
                />
              ) : // Billing details
              props.resolve.name === 'accounting_start_date' ? (
                <DateGroup
                  name="accounting_start_date"
                  label={translate('Accounting start date')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'bank_name' &&
                isFeatureVisible(CustomerFeatures.show_banking_data) ? (
                <StringGroup
                  name="bank_name"
                  label={translate('Bank name')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'bank_account' &&
                isFeatureVisible(CustomerFeatures.show_banking_data) ? (
                <StringGroup
                  name="bank_account"
                  label={translate('Bank account')}
                  disabled={submitting}
                />
              ) : // Billing tax
              props.resolve.name === 'vat_code' ? (
                <StringGroup
                  name="vat_code"
                  label={translate('VAT code')}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'default_tax_percent' ? (
                <NumberGroup
                  name="default_tax_percent"
                  label={translate('Tax percentage')}
                  unit="%"
                  min={0}
                  max={200}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'grace_period_days' ? (
                <NumberGroup
                  name="grace_period_days"
                  label={translate('Grace period (days)')}
                  description={translate(
                    'Number of extra days after project end date before resources are terminated',
                  )}
                  min={0}
                  disabled={submitting}
                />
              ) : props.resolve.name === 'project_slug_template' ? (
                <StringGroup
                  name="project_slug_template"
                  label={translate('Project slug template')}
                  description={translate(
                    'Placeholders: {customer_slug}, {project_name}, {year}, {month}, {counter}, {counter_padded}. Leave empty for default name-based slug.',
                  )}
                  disabled={submitting}
                />
              ) : null}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
