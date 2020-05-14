import * as React from 'react';

import { translate } from '@waldur/i18n';
import { LanguageList } from '@waldur/i18n/LanguageList';
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

export const AuthLogin = () => {
  const features = useAuthFeatures();
  const providers = React.useMemo(getAuthProviders, []);
  return (
    <>
      <CookiesConsent />
      <div className="middle-box text-center loginscreen footer-indent">
        <AuthHeader />
        {features.SigninForm && <SigninForm />}
        {features.SignupForm && <SignupForm />}
        {features.SocialSignup && (
          <p>
            <small>{translate('Or use social login')}</small>
          </p>
        )}
        {providers.map(
          provider =>
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
