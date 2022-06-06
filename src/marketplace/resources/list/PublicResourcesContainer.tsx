import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useProviderItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

export const PublicResourcesContainer: FunctionComponent = () => {
  useTitle(translate('Public resources'));
  useProviderItems();
  return (
    <Panel>
      <PublicResourcesList filters={<PublicResourcesFilter />} />
    </Panel>
  );
};
