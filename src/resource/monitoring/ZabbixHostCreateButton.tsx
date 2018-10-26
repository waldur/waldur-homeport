import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';

import { openCreateDialog } from './actions';

interface OwnProps {
  resource: any;
}

interface DispatchProps {
  onOpenCreateDialog(): void;
}

const PureZabbixHostCreateButton = props => (
  <a onClick={props.onOpenCreateDialog} className="btn btn-default btn-xs">
    <i className="text-info fa fa-line-chart"/>
    {' '}
    {props.translate('Resource is not monitored yet.')}
  </a>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenCreateDialog: () => dispatch(openCreateDialog(ownProps.resource)),
});

const enhance = compose(connect<{}, DispatchProps, OwnProps>(null, mapDispatchToProps), withTranslation);

export const ZabbixHostCreateButton = enhance(PureZabbixHostCreateButton);
