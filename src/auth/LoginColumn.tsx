import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@waldur/administration/api';
import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
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

import './LoginColumn.scss';

export const LoginColumn = () => {
  const features = useAuthFeatures();
  const imageUrl = fixURL('/icons/login_logo/');
  const { data, isLoading, error, refetch } = useQuery(
    ['IdentityProvidersConfigurations'],
    () => getIdentityProviders(),
  );

  return (
    <div className="LoginColumn">
      <div className="LoginBody">
        <div className="LoginGridItemContainer">
          <div className="LoginLogo mb-2">
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
      <div className="LoginFooter">
        <LanguageSelectorBox />
        <FooterLinks />
      </div>
    </div>
  );
};
