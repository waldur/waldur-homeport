import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { OfferingGrid } from '@waldur/marketplace/common/OfferingGrid';
import { ProviderData } from '@waldur/marketplace/service-providers/ProviderData';
import { ProviderDescription } from '@waldur/marketplace/service-providers/ProviderDescription';
import { Provider } from '@waldur/marketplace/types';
import { OfferingsListType } from '@waldur/marketplace/types';

interface ProviderDetailsProps {
  provider: Provider;
  providerOfferings: OfferingsListType;
}

export const ProviderDetails = (props: TranslateProps & ProviderDetailsProps) => (
  <div className="ibox">
    <div className="ibox-content">
      <div className="row">
        <div className="col-md-4">
          <ProviderDescription provider={props.provider} />
        </div>
        <div className="col-md-8">
          <ProviderData provider={props.provider} translate={props.translate}/>
          <OfferingGrid
            width={4}
            {...props.providerOfferings}
          />
        </div>
      </div>
    </div>
  </div>
);
