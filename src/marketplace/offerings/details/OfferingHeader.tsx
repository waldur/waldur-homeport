import React from 'react';
import { Col, Container } from 'react-bootstrap';

import { AuthService } from '@waldur/auth/AuthService';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { GoogleCalendarLinkField } from '@waldur/marketplace/offerings/details/GoogleCalendarLinkField';
import { ReferralDetailsField } from '@waldur/marketplace/referral/ReferralDetailsField';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';
import { BooleanField } from '@waldur/table/BooleanField';

interface OfferingHeaderProps {
  offering: Offering;
  hideName?: boolean;
}

export const OfferingHeader: React.FC<OfferingHeaderProps> = (props) => (
  <Col sm={12}>
    <Container>
      {!props.hideName && (
        <Field label={translate('Name')} value={props.offering.name} />
      )}

      <Field label={translate('Type')} value={getLabel(props.offering.type)} />

      <Field
        label={translate('Category')}
        value={props.offering.category_title}
      />

      <Field label={translate('State')} value={props.offering.state} />

      <Field
        label={translate('Shared')}
        value={
          <Tip
            id="shared-flag"
            label={translate('Accessible to all customers.')}
          >
            <BooleanField value={props.offering.shared} />
          </Tip>
        }
      />

      <Field
        label={translate('Billing enabled')}
        value={
          <Tip
            id="billing-flag"
            label={translate('Purchase and usage is invoiced.')}
          >
            <BooleanField value={props.offering.billable} />
          </Tip>
        }
      />

      <Field
        label={translate('Created')}
        value={formatDateTime(props.offering.created)}
      />

      <Field
        label={translate('Datacite DOI')}
        value={props.offering.datacite_doi}
      />

      <ReferralDetailsField offering={props.offering} />
    </Container>
    {AuthService.isAuthenticated() &&
      props.offering.type === OFFERING_TYPE_BOOKING && (
        <GoogleCalendarLinkField offering={props.offering} />
      )}
  </Col>
);
