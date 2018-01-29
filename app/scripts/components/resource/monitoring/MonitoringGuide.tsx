import * as React from 'react';

import { HtmlTabList } from './HtmlTabList';

export const MonitoringGuide = () => (
  <HtmlTabList
    tabs={[
      {
        title: 'Debian or Ubuntu',
        html: require('./MonitoringGuideDebian.md'),
      },
      {
        title: 'RedHat or CentOS',
        html: require('./MonitoringGuideRedHat.md'),
      },
      {
        title: 'Windows',
        html: require('./MonitoringGuideWindows.md'),
      },
    ]}
  />
);
