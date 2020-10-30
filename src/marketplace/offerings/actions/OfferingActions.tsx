import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { RequestActionDialog } from '@waldur/marketplace/offerings/actions/RequestActionDialog';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { updateOfferingState } from '../store/actions';
import { DRAFT, ACTIVE, ARCHIVED, PAUSED } from '../store/constants';

import { ActionsDropdown } from './ActionsDropdown';
import { PauseOfferingDialog } from './PauseOfferingDialog';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
});

const mapDispatchToProps = {
  updateOfferingState,
  pauseOffering: (offering) =>
    openModalDialog(PauseOfferingDialog, {
      resolve: { offering },
    }),
  requestPublishing: (offering) =>
    openModalDialog(RequestActionDialog, {
      resolve: { offering, offeringRequestMode: 'publishing' },
    }),
  requestEditing: (offering) =>
    openModalDialog(RequestActionDialog, {
      resolve: { offering, offeringRequestMode: 'editing' },
    }),
};

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  actions: [
    {
      label: translate('Activate'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.row, 'activate');
      },
      visible:
        [DRAFT, PAUSED].includes(ownProps.row.state) &&
        stateProps.user.is_staff,
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
      label: translate('Set to draft'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.row, 'draft');
      },
      visible:
        ![DRAFT].includes(ownProps.row.state) && stateProps.user.is_staff,
    },
    {
      label: translate('Edit'),
      handler: () =>
        $state.go('marketplace-offering-update', {
          offering_uuid: ownProps.row.uuid,
        }),
      visible:
        ownProps.row.state !== ARCHIVED &&
        (ownProps.row.state === DRAFT || stateProps.user.is_staff),
    },
    {
      label: translate('Screenshots'),
      handler: () =>
        $state.go('marketplace-offering-screenshots', {
          offering_uuid: ownProps.row.uuid,
        }),
      visible:
        ownProps.row.state !== ARCHIVED &&
        (ownProps.row.state === DRAFT || stateProps.user.is_staff),
    },
    {
      label: translate('Request publishing'),
      handler: () => dispatchProps.requestPublishing(ownProps.row),
      visible:
        [DRAFT].includes(ownProps.row.state) &&
        (!stateProps.user.is_staff || stateProps.user.is_owner),
    },
    {
      label: translate('Request editing'),
      handler: () => dispatchProps.requestEditing(ownProps.row),
      visible:
        [ACTIVE, PAUSED].includes(ownProps.row.state) &&
        (!stateProps.user.is_staff || stateProps.user.is_owner),
    },
  ].filter((row) => row.visible),
});

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const OfferingActions = enhance(ActionsDropdown);
