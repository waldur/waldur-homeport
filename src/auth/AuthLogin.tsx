import { useMemo, FunctionComponent, useEffect } from 'react';

import { UserAuthWarning } from '@waldur/auth/UserAuthWarning';
import { translate } from '@waldur/i18n';
import { LanguageList } from '@waldur/i18n/LanguageList';
import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';
import { AppFooter } from '@waldur/navigation/AppFooter';
import { CookiesConsent } from '@waldur/navigation/cookies/CookiesConsent';

import { getAuthProviders } from './auth-providers';
import { AuthButton } from './AuthButton';
import { AuthHeader } from './AuthHeader';
import { AuthService } from './AuthService';
import { PoweredBy } from './PoweredBy';
import { SigninButton } from './SigninButton';
import { SigninForm } from './SigninForm';
import { SignupButton } from './SignupButton';
import { SignupForm } from './SignupForm';
import { useAuthFeatures } from './useAuthFeatures';
import './AuthLogin.scss';

export const AuthLogin: FunctionComponent = () => {
  const features = useAuthFeatures();
  const locale = LanguageUtilsService.getCurrentLanguage().code;
  const providers = useMemo(getAuthProviders, [locale]);
  useEffect(() => AuthService.storeRedirect(), []);
  return (
    <>
      <CookiesConsent />
      <div className="gridContainer">
        <div className="flexContainer">
          <div className="headerContainer">
            <AuthHeader />
            <PoweredBy />
          </div>
          <div className="text-center loginscreen">
            {features.SigninForm && <SigninForm />}
            {features.SignupForm && <SignupForm />}
            {features.SigninForm && features.SocialSignup && (
              <p>
                <small>
                  {features.mode === 'register'
                    ? translate('Register with')
                    : translate('Sign in with')}
                </small>
              </p>
            )}
            {providers.map(
              (provider) =>
                features[provider.providerKey] && (
                  <AuthButton key={provider.providerKey} {...provider} />
                ),
            )}
            {features.SignupButton && <SignupButton />}
            {features.SigninButton && <SigninButton />}
            <UserAuthWarning />
            <LanguageList />
          </div>
        </div>
      </div>
      <AppFooter />
    </>
  );
};
