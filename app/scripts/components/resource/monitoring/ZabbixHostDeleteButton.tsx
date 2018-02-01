import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { getMonitoringState } from '@waldur/resource/monitoring/selectors';

import { deleteRequest } from './actions';

interface ZabbixHostDeleteButtonProps extends TranslateProps {
  onClick: () => void;
  deleting: boolean;
}

export const PureZabbixHostDeleteButton = (props: ZabbixHostDeleteButtonProps) => (
  <button
    type="button"
    className={classNames('btn btn-danger', {disabled: props.deleting})}
    onClick={props.onClick}>
    {props.deleting ?
      <i className="fa fa-spinner fa-spin m-r-xs"/> :
      <i className="fa fa-trash"/>
    }
    {' '}
    {props.translate('Delete Zabbix host')}
  </button>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(deleteRequest(ownProps.host.uuid)),
});

const enhance = compose(
  withTranslation,
  connect(getMonitoringState, mapDispatchToProps),
);

export const ZabbixHostDeleteButton = enhance(PureZabbixHostDeleteButton);
