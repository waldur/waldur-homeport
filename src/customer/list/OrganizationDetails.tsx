import { FunctionComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { RIGHT_ARROW_HTML } from '@waldur/customer/list/constants';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { Customer } from '@waldur/workspace/types';

interface OrganizationDetailsProps {
  customer: Customer;
}

export const OrganizationDetails: FunctionComponent<OrganizationDetailsProps> =
  (props) => (
    <Row>
      <Col sm={12}>
        <ResourceDetailsTable>
          <Field label={translate('Name')} value={props.customer.name} />
          <Field label={translate('UUID')} value={props.customer.uuid} />
          <Field
            label={translate('Abbreviation')}
            value={props.customer.abbreviation}
          />
          <Field
            label={translate('Division')}
            value={
              <>
                {props.customer.division_parent_name && (
                  <>
                    {props.customer.division_parent_name} {RIGHT_ARROW_HTML}{' '}
                  </>
                )}
                {props.customer.division_name}
              </>
            }
          />
          <Field label={translate('Email')} value={props.customer.email} />
          <Field
            label={translate('Agreement number')}
            value={props.customer.agreement_number}
          />
          <Field
            label={translate('Created')}
            value={formatDateTime(props.customer.created)}
          />
          <Field
            label={translate('Contact details')}
            value={props.customer.contact_details}
          />
          <Field label={translate('Country')} value={props.customer.country} />
          <Field label={translate('Address')} value={props.customer.address} />
          <Field label={translate('Postal')} value={props.customer.postal} />
          <Field
            label={translate('Phone number')}
            value={props.customer.phone_number}
          />
          <Field
            label={translate('Access subnets')}
            value={props.customer.access_subnets}
          />
          <Field
            label={translate('Accounting start date')}
            value={formatDateTime(props.customer.accounting_start_date)}
          />
          <Field
            label={translate('Bank account')}
            value={props.customer.bank_account}
          />
          <Field
            label={translate('Bank name')}
            value={props.customer.bank_name}
          />
          <Field
            label={translate('Default tax percent')}
            value={props.customer.default_tax_percent}
          />
          <Field
            label={translate('Registration code')}
            value={props.customer.registration_code}
          />
          <Field
            label={translate('VAT code')}
            value={props.customer.vat_code}
          />
          <Field label={translate('Domain')} value={props.customer.domain} />
          <Field
            label={translate('Is service provider')}
            value={
              props.customer.is_service_provider
                ? translate('Yes')
                : translate('No')
            }
          />
        </ResourceDetailsTable>
      </Col>
    </Row>
  );
