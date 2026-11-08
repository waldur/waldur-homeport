import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

import { AuthHeader } from '../AuthHeader';
import { AuthHeaderControls } from '../AuthHeaderControls';
import { IdentityProviderSelector } from '../IdentityProviderSelector';
import { LoginLogo } from '../LoginLogo';
import { PoweredBy } from '../PoweredBy';
import { SigninForm } from '../SigninForm';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './TabbedLayout.css';

type TabType = 'sso' | 'local';

export const TabbedLayout = () => {
  const features = useAuthFeatures();
  const [activeTab, setActiveTab] = useState<TabType>('sso');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  const hasSso = data && data.length > 0;
  const hasLocal = features.SigninForm;

  return (
    <div className="layout-tabbed">
      <div className="layout-tabbed-header">
        <LanguageSelectorBox />
        <AuthHeaderControls />
      </div>
      <div className="layout-tabbed-content">
        <div className="layout-tabbed-card">
          <LoginLogo className="mb-2.5" />
          <AuthHeader />

          {hasSso && hasLocal && (
            <div className="layout-tabbed-tabs">
              <button
                type="button"
                className={`layout-tabbed-tab ${activeTab === 'sso' ? 'active' : ''}`}
                onClick={() => setActiveTab('sso')}
              >
                {translate('Single Sign-On')}
              </button>
              <button
                type="button"
                className={`layout-tabbed-tab ${activeTab === 'local' ? 'active' : ''}`}
                onClick={() => setActiveTab('local')}
              >
                {translate('Local account')}
              </button>
            </div>
          )}

          <div className="layout-tabbed-panel">
            {activeTab === 'sso' && (
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
            )}

            {activeTab === 'local' && hasLocal && <SigninForm />}

            {!hasSso && hasLocal && <SigninForm />}
          </div>

          <UserAuthWarning />
          <PoweredBy />
        </div>
      </div>
      <div className="layout-tabbed-footer">
        <FooterLinks />
      </div>
    </div>
  );
};
