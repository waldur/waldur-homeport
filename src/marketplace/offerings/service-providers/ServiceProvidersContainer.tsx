import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { clearTokenHeader } from '@waldur/auth/AuthService';
import { removeToken } from '@waldur/auth/TokenStorage';
import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ServiceProvidersGrid } from '@waldur/marketplace/offerings/service-providers/ServiceProvidersGrid';
import { ServiceProvidersHeader } from '@waldur/marketplace/offerings/service-providers/ServiceProvidersHeader';
import { AnonymousHeader } from '@waldur/navigation/AnonymousHeader';
import { useTitle } from '@waldur/navigation/title';
import { getCurrentUser } from '@waldur/user/UsersService';

import './ServiceProvidersContainer.scss';

export const ServiceProvidersContainer: FunctionComponent = () => {
  const title = translate('Service providers in {title}', {
    title: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
  });
  const { loading, error } = useAsync(async () => {
    try {
      await getCurrentUser({ __skipLogout__: true });
    } catch (e) {
      if (e.response.status == 401) {
        removeToken();
        clearTokenHeader();
      }
    }
  });
  useTitle(title);
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <h3>{translate('Unable to fetch current user')}</h3>;
  } else {
    return (
      <>
        <AnonymousHeader />
        <div className="serviceProvidersContainer">
          <ServiceProvidersHeader />
          <ServiceProvidersGrid />
        </div>
      </>
    );
  }
};
