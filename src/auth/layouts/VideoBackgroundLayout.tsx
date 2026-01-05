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
import DefaultVideoBackground from '../default-video-background.mp4';
import DefaultHeroImage from '../estonian-bog.jpg';
import { LoginMethods } from '../LoginMethods';
import { PoweredBy } from '../PoweredBy';
import { useAuthFeatures } from '../useAuthFeatures';
import { UserAuthWarning } from '../UserAuthWarning';

import './VideoBackgroundLayout.css';

export const VideoBackgroundLayout = () => {
  const features = useAuthFeatures();
  const imageUrl = getIconUrl('login_logo');
  const customHeroImage = getIconUrl('hero_image');
  const fallbackImage = customHeroImage || DefaultHeroImage;
  const videoUrl =
    ENV.plugins.WALDUR_CORE.LOGIN_PAGE_VIDEO_URL || DefaultVideoBackground;
  const [videoFailed, setVideoFailed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  const handleVideoError = () => {
    setVideoFailed(true);
  };

  return (
    <div className="layout-video-bg">
      {!videoFailed ? (
        <video
          className="layout-video-bg-video"
          autoPlay
          loop
          muted
          playsInline
          poster={fallbackImage}
          onError={handleVideoError}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          className="layout-video-bg-fallback"
          style={{ backgroundImage: `url(${fallbackImage})` }}
        />
      )}
      <div className="layout-video-bg-overlay">
        <div className="layout-video-bg-header">
          <ThemeSwitcherButton />
        </div>
        <div className="layout-video-bg-content">
          <div className="layout-video-bg-card">
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
        </div>
        <div className="layout-video-bg-footer">
          <LanguageSelectorBox />
          <FooterLinks />
        </div>
      </div>
    </div>
  );
};
