import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { OfferingGrid } from '@/marketplace/common/OfferingGrid';
import { PAGE_CONTAINER_BOUNDED_CLASSNAME } from '@/navigation/pageContainer';
import { Field } from '@/resource/summary';

import { OfferingLogo } from '../common/OfferingLogo';

import './ProviderDetails.scss';

export const ProviderDetailsBody: FunctionComponent<{
  provider;
  offerings;
}> = ({ provider, offerings }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5">
    <div className="md:col-span-3">
      {provider.customer_image && (
        <div className="provider-description">
          <div className="provider-description__logo">
            <OfferingLogo src={provider.customer_image} />
          </div>
        </div>
      )}
    </div>
    <div className="md:col-span-9">
      <h2 className="font-bold mb-3">{provider.customer_name}</h2>
      <div>
        <div className={PAGE_CONTAINER_BOUNDED_CLASSNAME}>
          {provider.customer_native_name && (
            <Field
              label={translate('Native name')}
              value={provider.customer_native_name}
            />
          )}
          {provider.customer_abbreviation && (
            <Field
              label={translate('Abbreviation')}
              value={provider.customer_abbreviation}
            />
          )}
        </div>
      </div>

      <hr />
      <h3 className="font-bold mb-2.5">{translate('Offerings')}:</h3>
      <OfferingGrid width={4} loading={false} loaded={true} items={offerings} />
    </div>
  </div>
);
