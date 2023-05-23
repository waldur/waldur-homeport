import { FunctionComponent, useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PublicOfferingPricing } from '@waldur/marketplace/offerings/details/PublicOfferingPricing';
import { Offering } from '@waldur/marketplace/types';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

interface ProviderOfferingAccountingProps {
  offering: Offering;
}

export const ProviderOfferingAccounting: FunctionComponent<ProviderOfferingAccountingProps> =
  ({ offering }) => {
    if (!offering) return null;
    const canDeploy = useMemo(() => offering.state === 'Active', [offering]);

    return (
      <ProviderOfferingDataCard
        title={translate('Accounting')}
        icon="fa fa-usd"
        actions={
          <Button variant="light" className="mw-100px w-100">
            {translate('Edit')}
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus status="complete" />
          </div>
        }
      >
        <PublicOfferingPricing offering={offering} canDeploy={canDeploy} />
      </ProviderOfferingDataCard>
    );
  };
