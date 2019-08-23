import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { updateOfferingState } from '../store/actions';
import { DRAFT, ACTIVE, ARCHIVED, PAUSED } from '../store/constants';
import { ActionsDropdown } from './ActionsDropdown';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
});

const mapDispatchToProps = {
  updateOfferingState,
  pauseOffering: offering => openModalDialog('marketplacePauseOfferingDialog', { resolve: { offering } }),
};

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  actions: [
    {
      label: translate('Activate'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.row, 'activate');
      },
      visible: [DRAFT, PAUSED].includes(ownProps.row.state) && stateProps.user.is_staff,
    },
    {
      label: translate('Pause'),
      handler: () => dispatchProps.pauseOffering(ownProps.row),
      visible: ownProps.row.state === ACTIVE,
    },
    {
      label: translate('Archive'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.row, 'archive');
      },
      visible: ownProps.row.state !== ARCHIVED,
    },
    {
      label: translate('Edit'),
      handler: () => $state.go('marketplace-offering-update', {
        offering_uuid: ownProps.row.uuid,
      }),
      visible: ownProps.row.state !== ARCHIVED && (ownProps.row.state === DRAFT || stateProps.user.is_staff),
    },
  ].filter(row => row.visible),
});

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const OfferingActions = enhance(ActionsDropdown);
