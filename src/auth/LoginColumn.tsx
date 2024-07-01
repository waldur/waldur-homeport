import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getIdentityProviders } from '@waldur/administration/api';
import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
import { getQueryParams } from '@waldur/core/filters';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LanguageSelectorBox } from '@waldur/i18n/LanguageSelectorBox';
import { FooterLinks } from '@waldur/navigation/FooterLinks';

import { AuthHeader } from './AuthHeader';
import { IdentityProviderSelector } from './IdentityProviderSelector';
import { LocalLogin } from './LocalLogin';
import { PoweredBy } from './PoweredBy';
import { useAuthFeatures } from './useAuthFeatures';
import { UserAuthWarning } from './UserAuthWarning';
import { getOauthURL } from './utils';

import './LoginColumn.scss';

export const LoginColumn = () => {
  const features = useAuthFeatures();
  const imageUrl = fixURL('/icons/login_logo/');
  const { data, isLoading, error, refetch } = useQuery(
    ['IdentityProvidersConfigurations'],
    () => getIdentityProviders(),
  );
  const params = getQueryParams();

  useEffect(() => {
    if (params['disableAutoLogin'] === '') {
      return;
    }
    const provider = ENV.plugins.WALDUR_CORE.DEFAULT_IDP;
    if (!provider) {
      return;
    }
    window.location.href = getOauthURL(provider);
  }, [params]);

  return (
    <div className="login-column">
      <div className="login-body">
        <div className="login-grid-item-container">
          <div className="login-logo mb-2">
            <img
              alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
              src={imageUrl}
              style={{ maxWidth: '100%' }}
            />
          </div>
          <AuthHeader />
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred
              message={translate('Unable to load identity providers.')}
              loadData={refetch}
            />
          ) : data ? (
            <IdentityProviderSelector features={features} providers={data} />
          ) : null}
          {features.SigninForm && (
            <LocalLogin enableSeperator={features.enableSeperator} />
          )}
          <UserAuthWarning />
          <PoweredBy />
        </div>
      </div>
      <div className="login-footer">
        <LanguageSelectorBox />
        <FooterLinks />
      </div>
    </div>
  );
};
