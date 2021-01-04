import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { RootState } from '@waldur/store/reducers';

import { monitoringIsVisible } from './selectors';
import { ZabbixHost } from './types';
import { ZabbixHostCreateButton } from './ZabbixHostCreateButton';
import { ZabbixHostStateButton } from './ZabbixHostStateButton';

interface ZabbixHostFieldProps extends ResourceSummaryProps {
  isVisible: boolean;
  resource: {
    url?: string;
    zabbix_host?: ZabbixHost;
  };
}

export const PureZabbixHostField: FunctionComponent<ZabbixHostFieldProps> = (
  props,
) => {
  if (!props.isVisible) {
    return null;
  }
  let value;
  if (props.resource.zabbix_host) {
    value = <ZabbixHostStateButton host={props.resource.zabbix_host} />;
  } else {
    value = <ZabbixHostCreateButton resource={props.resource} />;
  }
  return <Field label={props.translate('Monitoring')} value={value} />;
};

const mapStateToProps = (state: RootState) => ({
  isVisible: monitoringIsVisible(state),
});

export const ZabbixHostField = connect(mapStateToProps)(
  withTranslation(PureZabbixHostField),
);
