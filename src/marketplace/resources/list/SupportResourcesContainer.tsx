import * as React from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

export const SupportResourcesContainer = () => {
  useTitle(translate('Resources'));
  return (
    <Panel>
      <SupportResourcesFilter />
      <SupportResourcesList />
    </Panel>
  );
};
