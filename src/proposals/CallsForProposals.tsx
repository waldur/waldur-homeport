import { FunctionComponent } from 'react';

import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { NewbiesGuideNotification } from '@waldur/dashboard/hero/NewbiesGuideNotification';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { CallsAvailableOfferingsList } from '@waldur/proposals/CallsAvailableOfferingsList';
import { CallsForProposalsList } from '@waldur/proposals/CallsForProposalsList';
import { useTheme } from '@waldur/theme/useTheme';

import DefaultDarkImage from './proposal-calls-dark.png';
import DefaultLightImage from './proposal-calls.png';

export const CallsForProposals: FunctionComponent = () => {
  const { theme } = useTheme();
  const defaultImage = theme === 'dark' ? DefaultDarkImage : DefaultLightImage;
  const backendImage = getIconUrl('call_management_hero_image');

  useFullPage();
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <>
      {showExperimentalUiComponents && (
        <NewbiesGuideNotification
          guideState="calls-for-proposals-dashboard"
          message={translate('New to {org} calls page?', {
            org: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
          })}
        />
      )}
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Calls for proposals')}
        context="calls"
        backgroundImage={`url(${backendImage}), url(${defaultImage})`}
      >
        <div className="d-flex justify-content-center gap-5">
          <Link
            state="calls-for-proposals-all-available-offerings"
            className="btn btn-outline w-200px btn-outline-default"
          >
            {translate('Available offerings')}
          </Link>
          <Link
            state="calls-for-proposals-all-calls"
            className="btn w-200px btn-primary"
          >
            {translate('See all calls')}
          </Link>
        </div>
      </LandingHeroSection>
      <div className="container-fluid my-14">
        <CallsForProposalsList />
      </div>
      <div className="container-fluid my-14">
        <CallsAvailableOfferingsList />
      </div>
    </>
  );
};
