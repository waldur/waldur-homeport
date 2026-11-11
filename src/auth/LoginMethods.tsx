import { FC, useState } from 'react';

import { DemoUserQuickLogin } from './DemoUserQuickLogin';
import { IdentityProviderSelector } from './IdentityProviderSelector';
import { LocalLoginButton, LocalLoginForm } from './LocalLogin';
import { AuthFeatures } from './useAuthFeatures';

interface LoginMethodsProps {
  features: AuthFeatures;
  providers: any[];
}

type LoginView = 'providers' | 'local-login';

export const LoginMethods: FC<LoginMethodsProps> = ({
  features,
  providers,
}) => {
  const [view, setView] = useState<LoginView>('providers');
  const hasOtherProviders = providers && providers.length > 0;

  return (
    <>
      {view === 'local-login' ? (
        <LocalLoginForm
          onBack={hasOtherProviders ? () => setView('providers') : undefined}
        />
      ) : (
        <>
          <IdentityProviderSelector features={features} providers={providers} />
          {features.SigninForm && (
            <LocalLoginButton onClick={() => setView('local-login')} />
          )}
        </>
      )}
      {/* In both views: on a demo it is the quickest way in. */}
      {features.SigninForm && <DemoUserQuickLogin />}
    </>
  );
};
