import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { NewbiesGuideNotification } from '@waldur/dashboard/hero/NewbiesGuideNotification';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { CallsForProposalsList } from '@waldur/proposals/CallsForProposalsList';

import { CallsSearchBox } from './CallsSearchBox';

const background = require('./proposal-calls.png');

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
          <Button variant="outline-white" className="btn-outline w-200px">
            {translate('Available offerings')}
          </Button>
          <Link
            state="calls-for-proposals-all-calls"
            className="btn btn-white btn-text-dark-always w-200px"
          >
            {translate('See all calls')}
          </Link>
        </div>
      </LandingHeroSection>
      <div className="h-50px bg-dark">
        <div className="container d-flex align-items-center justify-content-between text-inverse-dark h-100">
          <p className="fs-5 fw-bold mb-0 d-none d-md-block">
            {translate('Or if you know what you are looking for')}
          </p>
          <CallsSearchBox />
        </div>
      </div>
      <div className="container my-14">
        <CallsForProposalsList />
      </div>
    </div>
  );
};
