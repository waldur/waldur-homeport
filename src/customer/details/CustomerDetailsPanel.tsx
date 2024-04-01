import { useQuery } from '@tanstack/react-query';
import { Button, Card } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { SelectField, StringField, SubmitButton } from '@waldur/form';
import { FormSectionContainer } from '@waldur/form/FormSectionContainer';
import { translate } from '@waldur/i18n';
import { getAllOrganizationGroups } from '@waldur/marketplace/common/api';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { SetLocationButton } from '../list/SetLocationButton';

import { CustomerEditPanelProps } from './types';

const enhance = compose(
  connect((_: RootState, ownProps: CustomerEditPanelProps) => {
    const customer = ownProps.customer;
    const initialValues = {
      uuid: customer.uuid,
      name: customer.name,
      native_name: customer.native_name,
      abbreviation: customer.abbreviation,
      organization_group: customer.organization_group,
      domain: customer.domain,
      registration_code: customer.registration_code,
      agreement_number: customer.agreement_number,
      sponsor_number: customer.sponsor_number,
      address: customer.address,
      access_subnets: customer.access_subnets,
      postal: customer.postal,
    };
    return { initialValues };
  }),
  reduxForm({
    form: 'organizationEdit',
  }),
);

type OwnProps = CustomerEditPanelProps & InjectedFormProps;

export const CustomerDetailsPanel = enhance((props: OwnProps) => {
  const nativeNameVisible = useSelector(getNativeNameVisible);

  const {
    isLoading: groupsLoading,
    error: groupsError,
    data: organizationGroups,
    refetch: refetchGroups,
  } = useQuery(['organizationGroups'], () =>
    getAllOrganizationGroups().then((items) => {
      return items.map((item) => ({
        name: [item.parent_name, item.name].filter(Boolean).join(' ➔ '),
        value: item.url,
      }));
    }),
  );

  return (
    <Card id="basic-details">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Basic details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(props.callback)}>
          <FormSectionContainer
            label={translate('Basic details') + ':'}
            submitting={props.submitting}
            floating={true}
          >
            <StringField name="name" label={translate('Name')} />

            {nativeNameVisible ? (
              <StringField
                name="native_name"
                label={translate('Native name')}
              />
            ) : null}

            <StringField
              name="abbreviation"
              label={translate('Abbreviation')}
            />

            {groupsLoading ? (
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
            )}

            {isFeatureVisible(CustomerFeatures.show_domain) ? (
              <StringField
                name="domain"
                label={translate('Domain name')}
                description={translate('Home organization domain name')}
              />
            ) : null}

            <StringField name="address" label={translate('Address')} />

            {ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE ? (
              <StringField
                name="access_subnets"
                label={translate('Subnets')}
                description={translate(
                  'Subnets from where connection to self-service is allowed.',
                )}
              />
            ) : null}

            <StringField name="postal" label={translate('Postal code')} />
          </FormSectionContainer>

          <FormSectionContainer
            label={translate('Identifiers') + ':'}
            submitting={props.submitting}
            floating={true}
          >
            <StringField name="uuid" label={translate('UUID')} disabled />
            <StringField
              name="registration_code"
              label={translate('Registration code')}
            />
            <StringField
              name="agreement_number"
              label={translate('Agreement number')}
            />
            <StringField
              name="sponsor_number"
              label={translate('Sponsor number')}
            />
          </FormSectionContainer>

          <SetLocationButton customer={props.customer} />

          {props.dirty && (
            <div className="pull-right">
              <Button
                variant="secondary"
                size="sm"
                className="me-2"
                onClick={props.reset}
              >
                {translate('Discard')}
              </Button>
              <SubmitButton
                className="btn btn-primary btn-sm me-2"
                submitting={props.submitting}
                label={
                  props.canUpdate
                    ? translate('Save changes')
                    : translate('Propose changes')
                }
              />
            </div>
          )}
        </form>
      </Card.Body>
    </Card>
  );
});
