import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';

import background from './proposal-calls.png';
import { PublicCallsList } from './PublicCallsList';

interface PublicCallsPageProps {
  provider_uuid?: string;
}

export const PublicCallsPage: FunctionComponent<PublicCallsPageProps> = ({
  provider_uuid,
}) => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();
  useFullPage();

  return (
    <>
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Calls for proposals')}
        backgroundImage={background}
      />
      <div className="container-fluid mt-20 mb-10">
        <PublicCallsList
          offering_uuid={offering_uuid}
          provider_uuid={provider_uuid}
        />
      </div>
    </>
  );
};
