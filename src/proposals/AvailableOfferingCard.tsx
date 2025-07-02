import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';
import { OfferingDetailsLink } from '@waldur/marketplace/links/OfferingDetailsLink';

export const AvailableOfferingCard: FC<{ availableOffering }> = ({
  availableOffering,
}) => (
  <OfferingDetailsLink offering_uuid={availableOffering.uuid}>
    <ModelCard1
      title={availableOffering.name}
      subtitle={availableOffering.customer_name}
      body={availableOffering.description}
      clickable
      footer={
        <div className="d-flex justify-content-end gap-2">
          <Link
            state="calls-for-proposals-all-calls"
            params={{ offering_uuid: availableOffering.uuid }}
            className="btn btn-text-primary btn-active-secondary btn-sm"
            label={translate('Apply')}
          />

          <OfferingDetailsLink
            offering_uuid={availableOffering.uuid}
            className="btn btn-text-primary btn-active-secondary btn-sm"
          >
            {translate('View offering')}
          </OfferingDetailsLink>
        </div>
      }
    />
  </OfferingDetailsLink>
);
