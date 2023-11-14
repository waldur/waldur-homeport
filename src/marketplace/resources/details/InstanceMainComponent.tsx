import { useContext, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { MonitoringCharts } from './MonitoringCharts';

export const InstanceMainComponent = () => {
  const experimentalUiComponentsVisible = isExperimentalUiComponentsVisible();
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    if (experimentalUiComponentsVisible) {
      addTabs([
        {
          key: 'monitoring',
          title: translate('Monitoring'),
        },
      ]);
    }
  });
  return experimentalUiComponentsVisible ? <MonitoringCharts /> : null;
};
