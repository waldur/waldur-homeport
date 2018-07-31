import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { providers } from '@waldur/marketplace/fixtures';
import { products } from '@waldur/marketplace/fixtures';
import { ProviderData } from '@waldur/marketplace/service-providers/ProviderData';
import { ProviderDescription } from '@waldur/marketplace/service-providers/ProviderDescription';
import { connectAngularComponent } from '@waldur/store/connect';

export const ProviderDetails = withTranslation((props: TranslateProps) => (
  <div className="ibox">
    <div className="ibox-content">
      <div className="row">
        <div className="col-md-4">
          <ProviderDescription provider={providers[0]} />
        </div>
        <div className="col-md-8">
          <ProviderData provider={providers[0]} translate={props.translate}/>
          <ProductGrid items={products} loading={false} loaded={true} width={4}/>
        </div>
      </div>
    </div>
  </div>
));

export default connectAngularComponent(ProviderDetails);
