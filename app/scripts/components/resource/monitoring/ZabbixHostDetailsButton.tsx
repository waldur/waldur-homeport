import * as React from 'react';
import { connect } from 'react-redux';

import { openDetailsDialog } from './actions';

const PureZabbixHostDetailsButton = props => (
  <a className="btn btn-default btn-xs" onClick={props.onOpenDetailsDialog}>
    <i className={`${props.textClass} fa fa-line-chart`}/>
    {' '}
    {props.label}
  </a>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenDetailsDialog: () => dispatch(openDetailsDialog(ownProps.host)),
});

export const ZabbixHostDetailsButton = connect(null, mapDispatchToProps)(PureZabbixHostDetailsButton);
