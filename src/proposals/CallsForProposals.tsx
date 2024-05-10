import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { CallsForProposalsList } from '@waldur/proposals/CallsForProposalsList';

import { HeroSection } from './HeroSection';

import './PublicCallsPage.scss';

export const CallsForProposals: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('Calls for proposals'));

  return (
    <div className="public-calls-page">
      <HeroSection
        title={
          ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE +
          ' ' +
          translate('calls for proposals')
        }
      />
      <div className="container my-14">
        <CallsForProposalsList />
      </div>
    </div>
  );
};
