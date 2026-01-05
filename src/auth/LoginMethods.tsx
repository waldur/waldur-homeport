import { FC, useState } from 'react';

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

  if (view === 'local-login') {
    return (
      <LocalLoginForm
        onBack={hasOtherProviders ? () => setView('providers') : undefined}
      />
    );
  }

  return (
    <>
      <IdentityProviderSelector features={features} providers={providers} />
      {features.SigninForm && (
        <LocalLoginButton onClick={() => setView('local-login')} />
      )}
    </>
  );
};
