import { useMemo, FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { LanguageList } from '@waldur/i18n/LanguageList';
import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';
import { AppFooter } from '@waldur/navigation/AppFooter';
import { CookiesConsent } from '@waldur/navigation/cookies/CookiesConsent';

import { getAuthProviders } from './auth-providers';
import { AuthButton } from './AuthButton';
import { AuthHeader } from './AuthHeader';
import { PoweredBy } from './PoweredBy';
import { SigninButton } from './SigninButton';
import { SigninForm } from './SigninForm';
import { SignupButton } from './SignupButton';
import { SignupForm } from './SignupForm';
import { useAuthFeatures } from './useAuthFeatures';

export const AuthLogin: FunctionComponent = () => {
  const features = useAuthFeatures();
  const locale = LanguageUtilsService.getCurrentLanguage().code;
  const providers = useMemo(getAuthProviders, [locale]);
  return (
    <>
      <CookiesConsent />
      <div className="middle-box text-center loginscreen footer-indent">
        <AuthHeader />
        {features.SigninForm && <SigninForm />}
        {features.SignupForm && <SignupForm />}
        {features.SigninForm && features.SocialSignup && (
          <p>
            <small>{translate('Or use social login')}</small>
          </p>
        )}
        {providers.map(
          (provider) =>
            features[provider.providerKey] && (
              <AuthButton
                key={provider.providerKey}
                {...provider}
                mode={features.mode}
              />
            ),
        )}
        {features.SignupButton && <SignupButton />}
        {features.SigninButton && <SigninButton />}
        <LanguageList />
        <PoweredBy />
      </div>
      <AppFooter />
    </>
  );
};
