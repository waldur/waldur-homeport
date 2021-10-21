import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { ServiceProvidersGrid } from '@waldur/marketplace/offerings/service-providers/ServiceProvidersGrid';
import { ServiceProvidersHeader } from '@waldur/marketplace/offerings/service-providers/ServiceProvidersHeader';
import { AnonymousHeader } from '@waldur/navigation/AnonymousHeader';
import { useTitle } from '@waldur/navigation/title';
import './ServiceProvidersContainer.scss';

export const ServiceProvidersContainer: FunctionComponent = () => {
  const title = translate('Service providers in {title}', {
    title: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
  });
  useTitle(title);
  return (
    <>
      <AnonymousHeader />
      <div className="serviceProvidersContainer">
        <ServiceProvidersHeader />
        <ServiceProvidersGrid />
      </div>
    </>
  );
};
