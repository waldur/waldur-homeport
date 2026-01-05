import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getIdentityProviders } from '@waldur/administration/api';
import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LanguageSelectorBox } from '@waldur/i18n/LanguageSelectorBox';
import { FooterLinks } from '@waldur/navigation/FooterLinks';
import { ThemeSwitcherButton } from '@waldur/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { IdentityProviderSelector } from '../IdentityProviderSelector';
import { PoweredBy } from '../PoweredBy';
import { SigninForm } from '../SigninForm';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './WizardLayout.css';

type Step = 'welcome' | 'method' | 'login';

export const WizardLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const [step, setStep] = useState<Step>('welcome');
  const [useSSO, setUseSSO] = useState(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  const hasSso = data && data.length > 0;
  const hasLocal = features.SigninForm;

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="layout-wizard-step">
            <h2>{translate('Welcome')}</h2>
            <p className="text-muted">
              {ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg w-100 mt-4"
              onClick={() => setStep(hasSso && hasLocal ? 'method' : 'login')}
            >
              {translate('Get Started')}
            </button>
          </div>
        );

      case 'method':
        return (
          <div className="layout-wizard-step">
            <h2>{translate('Choose Sign-in Method')}</h2>
            <p className="text-muted">
              {translate('How would you like to sign in?')}
            </p>
            <div className="layout-wizard-methods">
              <button
                type="button"
                className="layout-wizard-method"
                onClick={() => {
                  setUseSSO(true);
                  setStep('login');
                }}
              >
                <i className="fa fa-shield" />
                <span>{translate('Single Sign-On')}</span>
                <small>{translate('Use your organization account')}</small>
              </button>
              <button
                type="button"
                className="layout-wizard-method"
                onClick={() => {
                  setUseSSO(false);
                  setStep('login');
                }}
              >
                <i className="fa fa-key" />
                <span>{translate('Username & Password')}</span>
                <small>{translate('Use local credentials')}</small>
              </button>
            </div>
            <button
              type="button"
              className="btn btn-link mt-3"
              onClick={() => setStep('welcome')}
            >
              {translate('Back')}
            </button>
          </div>
        );

      case 'login':
        return (
          <div className="layout-wizard-step">
            <AuthHeader />
            {useSSO && hasSso ? (
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
              </>
            ) : hasLocal ? (
              <SigninForm />
            ) : null}
            <UserAuthWarning />
            <button
              type="button"
              className="btn btn-link mt-3"
              onClick={() => setStep(hasSso && hasLocal ? 'method' : 'welcome')}
            >
              {translate('Back')}
            </button>
          </div>
        );
    }
  };

  const getProgress = () => {
    switch (step) {
      case 'welcome':
        return 33;
      case 'method':
        return 66;
      case 'login':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="layout-wizard">
      <div className="layout-wizard-header">
        <ThemeSwitcherButton />
      </div>
      <div className="layout-wizard-content">
        <div className="layout-wizard-card">
          <div className="login-logo mb-3">
            <img
              alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
              src={imageUrl}
              style={{ maxWidth: '100%', maxHeight: '70px' }}
            />
          </div>

          <div className="layout-wizard-progress">
            <div
              className="layout-wizard-progress-bar"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {renderStep()}

          <PoweredBy />
        </div>
      </div>
      <div className="layout-wizard-footer">
        <LanguageSelectorBox />
        <FooterLinks />
      </div>
    </div>
  );
};
