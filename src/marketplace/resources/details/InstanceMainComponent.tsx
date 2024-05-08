import { useContext, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { MonitoringCharts } from './MonitoringCharts';

export const InstanceMainComponent = ({ activeTab }) => {
  const experimentalUiComponentsVisible = isExperimentalUiComponentsVisible();
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    if (experimentalUiComponentsVisible) {
      addTabs([
        {
          key: 'monitoring',
          title: translate('Monitoring'),
          priority: 12,
        },
      ]);
    }
  });
  return experimentalUiComponentsVisible ? (
    <div className={activeTab === 'monitoring' ? undefined : 'd-none'}>
      <MonitoringCharts />
    </div>
  ) : null;
};
