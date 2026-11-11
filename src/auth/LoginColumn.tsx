import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from './AuthHeader';
import { AuthHeaderControls } from './AuthHeaderControls';
import { DemoUserQuickLogin } from './DemoUserQuickLogin';
import { IdentityProviderSelector } from './IdentityProviderSelector';
import { LocalLoginButton, LocalLoginForm } from './LocalLogin';
import { LoginLogo } from './LoginLogo';
import { PoweredBy } from './PoweredBy';
import { useAuthFeatures } from './useAuthFeatures';
import { UserAuthWarning } from './UserAuthWarning';

import './LoginColumn.scss';

type LoginView = 'providers' | 'local-login';

export const LoginColumn = () => {
  const features = useAuthFeatures();
  const currentLanguage = LanguageUtilsService.getCurrentLanguage();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });
  const [view, setView] = useState<LoginView>('providers');

  const hasOtherProviders = data && data.length > 0;

  return (
    <div className="login-column">
      <div className="login-header">
        <LanguageSelectorBox />
        <AuthHeaderControls />
      </div>
      <div className="login-body">
        <div className="login-grid-item-container">
          <LoginLogo className="mb-1.5" language={currentLanguage?.code} />
          <AuthHeader />
          {view === 'providers' ? (
            <>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <LoadingErred
                  message={translate('Unable to load identity providers.')}
                  loadData={refetch}
                />
              ) : data ? (
                <IdentityProviderSelector
                  features={features}
                  providers={data}
                />
              ) : null}
              {features.SigninForm && (
                <LocalLoginButton onClick={() => setView('local-login')} />
              )}
            </>
          ) : (
            <LocalLoginForm
              onBack={
                hasOtherProviders ? () => setView('providers') : undefined
              }
            />
          )}
          {/* In both views: on a demo it is the quickest way in. */}
          {features.SigninForm && <DemoUserQuickLogin />}
          <UserAuthWarning />
          <PoweredBy />
        </div>
      </div>
      <div className="login-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
