import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { ProviderData } from '@waldur/marketplace/service-providers/ProviderData';
import { ProviderDescription } from '@waldur/marketplace/service-providers/ProviderDescription';
import { Provider } from '@waldur/marketplace/types';
import { ProductsListType } from '@waldur/marketplace/types';

interface ProviderDetailsProps {
  provider: Provider;
  providerOfferings: ProductsListType;
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
          <ProductGrid
            width={4}
            {...props.providerOfferings}
          />
        </div>
      </div>
    </div>
  </div>
);
