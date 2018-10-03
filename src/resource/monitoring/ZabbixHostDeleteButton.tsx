import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation, translate } from '@waldur/i18n';

import { deleteRequest } from './actions';
import { getMonitoringState } from './selectors';
import { ZabbixHost } from './types';

interface ZabbixHostDeleteButtonProps extends TranslateProps {
  onClick: () => void;
  deleting: boolean;
  host: ZabbixHost;
}

const canDeleteHost = host => host && (host.state === 'OK' || host.state === 'Erred');

export const PureZabbixHostDeleteButton = (props: ZabbixHostDeleteButtonProps) =>
  canDeleteHost(props.host) ? (
    <button
      type="button"
      className="btn btn-danger"
      disabled={props.deleting}
      onClick={props.onClick}>
      {props.deleting ?
        <i className="fa fa-spinner fa-spin m-r-xs"/> :
        <i className="fa fa-trash"/>
      }
      {' '}
      {props.translate('Delete Zabbix host')}
    </button>
  ) : null;

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    const confirmMessage = translate('Do you really want to delete Zabbix host?');
    const confirm = window.confirm(confirmMessage);
    if (confirm) {
      dispatch(deleteRequest(ownProps.host.uuid));
    }
  },
});

const enhance = compose(
  connect(getMonitoringState, mapDispatchToProps),
  withTranslation,
);

export const ZabbixHostDeleteButton = enhance(PureZabbixHostDeleteButton);
