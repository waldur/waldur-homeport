import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { ReferralDetailsField } from '@waldur/marketplace/referral/ReferralDetailsField';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';
import { BooleanField } from '@waldur/table-react/BooleanField';

interface OfferingHeaderProps {
  offering: Offering;
  hideName?: boolean;
}

export const OfferingHeader: React.FC<OfferingHeaderProps> = props => (
  <dl className="dl-horizontal resource-details-table col-sm-12">
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
        <Tooltip
          id="shared-flag"
          label={translate('Accessible to all customers.')}
        >
          <BooleanField value={props.offering.shared} />
        </Tooltip>
      }
    />

    <Field
      label={translate('Billing enabled')}
      value={
        <Tooltip
          id="billing-flag"
          label={translate('Purchase and usage is invoiced.')}
        >
          <BooleanField value={props.offering.billable} />
        </Tooltip>
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
  </dl>
);
