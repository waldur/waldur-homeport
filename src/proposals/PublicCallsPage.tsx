import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';

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
        title={translate('All calls')}
        context="calls"
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
