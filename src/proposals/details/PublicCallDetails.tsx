import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import { Call } from '../types';

import { CallBreadcrumbs } from './CallBreadcrumbs';
import { CallDescriptionCard } from './CallDescriptionCard';
import { CallDocumentsCard } from './CallDocumentsCard';
import { CallOfferingsCard } from './CallOfferingsCard';
import { CallRoundsList } from './CallRoundsList';
import { CallTabs } from './CallTabs';
import { PublicCallDetailsHero } from './PublicCallDetailsHero';

interface PublicCallDetailsProps {
  call: Call;
  refreshCall;
}

const getTabs = (): PageBarTab[] => {
  return [
    {
      key: 'description',
      title: translate('Description'),
      component: CallDescriptionCard,
    },
    {
      key: 'rounds',
      title: translate('Rounds'),
      component: CallRoundsList,
    },
    {
      key: 'documents',
      title: translate('Documents'),
      component: CallDocumentsCard,
    },
    {
      key: 'offerings',
      title: translate('Offerings'),
      component: CallOfferingsCard,
    },
  ];
};

const PageHero = ({ call }) => (
  <div className="container-fluid mb-8 mt-6">
    <CallTabs call={call} />
    <PublicCallDetailsHero call={call} />
  </div>
);

export const PublicCallDetails: FunctionComponent<PublicCallDetailsProps> = ({
  call,
}) => {
  usePageHero(<PageHero call={call} />);

  useBreadcrumbs(<CallBreadcrumbs call={call} />);

  const tabs = useMemo(() => getTabs(), []);
  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  return <Component call={call} />;
};
