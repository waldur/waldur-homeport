import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { formatTemplate } from '@waldur/i18n/translate';

import { HtmlTabList } from './HtmlTabList';

interface MonitoringGuideProps extends TranslateProps {
  resource: {
    uuid: string;
  };
  link: {
    internal_ip: string;
  };
}

export const MonitoringGuide = (props: MonitoringGuideProps) => {
  const formatGuide = template =>
    formatTemplate(template, {
      ZABBIX_CLIENT_ID: props.resource.uuid,
      ZABBIX_SERVER_IP: props.link.internal_ip,
    });

  return (
    <>
      <p>{props.translate('In order to enable monitoring you should install and configure Zabbix agent on monitored virtual machine.')}</p>
      <HtmlTabList
        tabs={[
          {
            title: 'Debian or Ubuntu',
            html: formatGuide(require('./MonitoringGuideDebian.md')),
          },
          {
            title: 'RedHat or CentOS',
            html: formatGuide(require('./MonitoringGuideRedHat.md')),
          },
          {
            title: 'Windows',
            html: formatGuide(require('./MonitoringGuideWindows.md')),
          },
        ]}
      />
    </>
  );
};
