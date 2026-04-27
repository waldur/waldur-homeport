import { useQuery } from '@tanstack/react-query';

import { getIdentityProviders } from '@/administration/api';
import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { FooterLinks } from '@/navigation/footer/FooterLinks';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

import { AuthHeader } from '../AuthHeader';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './NewsLayout.css';

export const NewsLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const newsItems = ENV.plugins.WALDUR_CORE.LOGIN_PAGE_NEWS || [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  return (
    <div className="layout-news">
      <div className="layout-news-login">
        <div className="layout-news-header">
          <LanguageSelectorBox />
          <ThemeSwitcherButton />
        </div>
        <div className="layout-news-form">
          <div className="login-logo mb-3">
            <img
              alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
              src={imageUrl}
              style={{ maxWidth: '100%', maxHeight: '80px' }}
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
            <LoginMethods features={features} providers={data} />
          ) : null}
          <UserAuthWarning />
          <PoweredBy />
        </div>
        <div className="layout-news-footer">
          <FooterLinks />
        </div>
      </div>
      <div className="layout-news-content">
        <div className="layout-news-content-inner">
          <h2>{translate('Latest Updates')}</h2>
          <div className="layout-news-list">
            {newsItems.map((item, index) => (
              <div key={index} className="layout-news-item">
                <div className="layout-news-item-header">
                  <span className="layout-news-date">{item.date}</span>
                  <span className="layout-news-tag">{item.tag}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
