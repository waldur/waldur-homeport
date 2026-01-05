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

import './TabbedLayout.css';

type TabType = 'sso' | 'local';

export const TabbedLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
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
        <ThemeSwitcherButton />
      </div>
      <div className="layout-tabbed-content">
        <div className="layout-tabbed-card">
          <div className="login-logo mb-3">
            <img
              alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
              src={imageUrl}
              style={{ maxWidth: '100%', maxHeight: '80px' }}
            />
          </div>
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
        <LanguageSelectorBox />
        <FooterLinks />
      </div>
    </div>
  );
};
