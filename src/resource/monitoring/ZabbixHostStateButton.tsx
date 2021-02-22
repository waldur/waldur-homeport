import { FunctionComponent } from 'react';

import { Translate, TranslateProps, withTranslation } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/types';

import { ZabbixHostDetailsButton } from './ZabbixHostDetailsButton';

const mapStateToParams = (state: ResourceState, translate: Translate) => {
  switch (state) {
    case 'OK':
      return {
        textClass: 'text-info',
        label: translate('Resource is monitored using Zabbix.'),
      };
    case 'Creation Scheduled':
    case 'Creating':
      return {
        textClass: 'text-warning',
        label: translate('Monitoring system is being provisioned.'),
      };
    case 'Update Scheduled':
    case 'Updating':
      return {
        textClass: 'text-warning',
        label: translate('Monitoring system is being updated.'),
      };
    case 'Deletion Scheduled':
    case 'Deleting':
      return {
        textClass: 'text-warning',
        label: translate('Monitoring system is being deleted.'),
      };

    case 'Erred':
    default:
      return {
        textClass: 'text-danger',
        label: translate('Monitoring system has failed.'),
      };
  }
};

interface ZabbixHostStateButtonProps extends TranslateProps {
  host: {
    state: ResourceState;
  };
}

export const PureZabbixHostStateButton: FunctionComponent<ZabbixHostStateButtonProps> = (
  props,
) => {
  const params = mapStateToParams(props.host.state, props.translate);
  return <ZabbixHostDetailsButton host={props.host} {...params} />;
};

export const ZabbixHostStateButton = withTranslation(PureZabbixHostStateButton);
