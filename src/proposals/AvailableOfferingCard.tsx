import { FC } from 'react';

import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';

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
            buttonVariant="text-primary"
            className="btn-sm"
            label={translate('Apply to call')}
          />

          <OfferingDetailsLink
            offering_uuid={availableOffering.uuid}
            buttonVariant="text-primary"
            className="btn-sm"
          >
            {translate('View offering')}
          </OfferingDetailsLink>
        </div>
      }
    />
  </OfferingDetailsLink>
);
