import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
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
        <div className="flex justify-center gap-4">
          <Link
            state="calls-for-proposals-all-available-offerings"
            buttonVariant="tertiary"
            className="w-[200px]"
          >
            {translate('Available offerings')}
          </Link>
          <Link
            state="calls-for-proposals-all-calls"
            buttonVariant="primary"
            className="w-[200px]"
          >
            {translate('All calls')}
          </Link>
        </div>
      </LandingHeroSection>
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-11.5')}>
        <CallsForProposalsList />
      </div>
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-11.5')}>
        <CallsAvailableOfferingsList />
      </div>
    </>
  );
};
