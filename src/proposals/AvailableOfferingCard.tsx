import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';

export const AvailableOfferingCard: FC<{ availableOffering }> = ({
  availableOffering,
}) => (
  <ModelCard1
    title={availableOffering.name}
    subtitle={availableOffering.customer_name}
    body={availableOffering.description}
    footer={
      <div className="d-flex justify-content-between">
        <Link
          state="calls-for-proposals-all-calls"
          params={{ offering_uuid: availableOffering.uuid }}
          className="btn btn-flush text-anchor"
          label={translate('Apply')}
        />
        <Link
          state="public-offering.marketplace-public-offering"
          params={{ uuid: availableOffering.uuid }}
          className="btn btn-flush text-anchor"
          label={translate('View offering')}
        />
      </div>
    }
  />
);
