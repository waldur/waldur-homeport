import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { NewbiesGuideNotification } from '@waldur/dashboard/hero/NewbiesGuideNotification';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { CallsAvailableOfferingsList } from '@waldur/proposals/CallsAvailableOfferingsList';
import { CallsForProposalsList } from '@waldur/proposals/CallsForProposalsList';

import background from './proposal-calls.png';

export const CallsForProposals: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('Calls for proposals'));

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <div className="public-calls-page">
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
        backgroundImage={background}
      >
        <div className="d-flex justify-content-center gap-5">
          <Link
            state="calls-for-proposals-all-available-offerings"
            className="btn btn-outline btn-outline-white w-200px"
          >
            {translate('Available offerings')}
          </Link>
          <Link
            state="calls-for-proposals-all-calls"
            className="btn btn-white btn-text-dark-always w-200px"
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
    </div>
  );
};
