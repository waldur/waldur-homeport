import { FunctionComponent } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';
import { CallsAvailableOfferingsList } from '@/proposals/CallsAvailableOfferingsList';
import { CallsForProposalsList } from '@/proposals/CallsForProposalsList';
import { useTheme } from '@/theme/useTheme';

import DefaultDarkImage from './proposal-calls-dark.png';
import DefaultLightImage from './proposal-calls.png';

export const CallsForProposals: FunctionComponent = () => {
  const { theme } = useTheme();
  const defaultImage = theme === 'dark' ? DefaultDarkImage : DefaultLightImage;
  const backendImage = getIconUrl('call_management_hero_image');

  useFullPage();

  return (
    <>
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Calls for proposals')}
        context="calls"
        backgroundImage={`url(${backendImage}), url(${defaultImage})`}
      >
        <div className="d-flex justify-content-center gap-5">
          <Link
            state="calls-for-proposals-all-available-offerings"
            className="btn btn-tertiary w-200px"
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
