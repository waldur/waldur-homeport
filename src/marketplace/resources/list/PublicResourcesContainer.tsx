import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

export const PublicResourcesContainer: FunctionComponent = () => {
  useTitle(translate('Public resources'));
  useSidebarKey('marketplace-services');
  return (
    <Panel>
      <PublicResourcesFilter />
      <PublicResourcesList />
    </Panel>
  );
};
