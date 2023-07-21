import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import {
  isVisible,
  supportOfferingActionVisible,
} from '@waldur/marketplace/offerings/actions/utils';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { RootState } from '@waldur/store/reducers';
import {
  getCustomer,
  getUser,
  isOwner,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import * as actions from '../store/actions';
import { DRAFT, ACTIVE, ARCHIVED, PAUSED } from '../store/constants';

import { ActionsDropdown } from './ActionsDropdown';

const SetLocationDialog = lazyComponent(
  () => import('@waldur/map/SetLocationDialog'),
  'SetLocationDialog',
);
const RequestActionDialog = lazyComponent(
  () => import('@waldur/marketplace/offerings/actions/RequestActionDialog'),
  'RequestActionDialog',
);
const PauseOfferingDialog = lazyComponent(
  () => import('./PauseOfferingDialog'),
  'PauseOfferingDialog',
);
const EditConfirmationMessageDialog = lazyComponent(
  () => import('./EditConfirmationMessageDialog'),
  'EditConfirmationMessageDialog',
);
const SetAccessPolicyDialog = lazyComponent(
  () => import('./SetAccessPolicyDialog'),
  'SetAccessPolicyDialog',
);
const UpdateOfferingLogoDialog = lazyComponent(
  () => import('./UpdateOfferingLogoDialog'),
  'UpdateOfferingLogoDialog',
);

interface OwnProps {
  offering: Offering;
  isPublic?: boolean;
  refreshOffering?: () => void;
}

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  customer: getCustomer(state),
  isOwner: isOwner(state),
  isServiceManager: isServiceManagerSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateOfferingState: (
    offering: Offering,
    stateAction,
    reason?,
    isPublic?,
    refreshOffering?,
  ) => {
    dispatch(
      actions.updateOfferingState(
        offering,
        stateAction,
        reason,
        isPublic,
        refreshOffering,
      ),
    );
  },
  pauseOffering: (
    offering: Offering,
    isPublic: boolean,
    refreshOffering: () => void,
  ) =>
    dispatch(
      openModalDialog(PauseOfferingDialog, {
        resolve: { offering, isPublic, refreshOffering },
      }),
    ),
  requestPublishing: (offering: Offering) =>
    dispatch(
      openModalDialog(RequestActionDialog, {
        resolve: { offering, offeringRequestMode: 'publishing' },
      }),
    ),
  requestEditing: (offering: Offering) =>
    dispatch(
      openModalDialog(RequestActionDialog, {
        resolve: { offering, offeringRequestMode: 'editing' },
      }),
    ),
  setLocation: (offering: Offering) =>
    dispatch(
      openModalDialog(SetLocationDialog, {
        resolve: {
          data: offering,
          setLocationFn: (offeringData) =>
            dispatch(actions.addOfferingLocation(offeringData)),
          label: translate('Location of {name} offering', {
            name: offering.name,
          }),
        },
        size: 'lg',
      }),
    ),
  editConfirmationMessage: (offering: Offering) =>
    dispatch(
      openModalDialog(EditConfirmationMessageDialog, {
        resolve: {
          offeringUuid: offering.uuid,
        },
        size: 'lg',
      }),
    ),
  setAccessPolicy: (offering: Offering) =>
    dispatch(
      openModalDialog(SetAccessPolicyDialog, {
        resolve: { offering },
      }),
    ),
  updateLogo: (offering: Offering) =>
    dispatch(
      openModalDialog(UpdateOfferingLogoDialog, {
        resolve: { offering },
      }),
    ),
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps,
) => ({
  actions: [
    {
      label: translate('Activate'),
      handler: () => {
        dispatchProps.updateOfferingState(
          ownProps.offering,
          'activate',
          '',
          ownProps.isPublic,
          ownProps.refreshOffering,
        );
      },
      visible:
        [DRAFT, PAUSED].includes(ownProps.offering.state) &&
        stateProps.user?.is_staff,
    },
    {
      label: translate('Pause'),
      handler: () =>
        dispatchProps.pauseOffering(
          ownProps.offering,
          ownProps.isPublic,
          ownProps.refreshOffering,
        ),
      visible: ownProps.offering.state === ACTIVE,
    },
    {
      label: translate('Unpause'),
      handler: () => {
        dispatchProps.updateOfferingState(
          ownProps.offering,
          'unpause',
          '',
          ownProps.isPublic,
          ownProps.refreshOffering,
        );
      },
      visible: ownProps.offering.state === PAUSED,
    },
    {
      label: translate('Archive'),
      handler: () => {
        dispatchProps.updateOfferingState(
          ownProps.offering,
          'archive',
          '',
          ownProps.isPublic,
          ownProps.refreshOffering,
        );
      },
      visible: ownProps.offering.state !== ARCHIVED,
    },
    {
      label: translate('Set to draft'),
      handler: () => {
        dispatchProps.updateOfferingState(
          ownProps.offering,
          'draft',
          '',
          ownProps.isPublic,
          ownProps.refreshOffering,
        );
      },
      visible: ownProps.offering.state !== DRAFT && stateProps.user?.is_staff,
    },
    {
      label: translate('Request publishing'),
      handler: () => dispatchProps.requestPublishing(ownProps.offering),
      visible:
        !ownProps.isPublic &&
        [DRAFT].includes(ownProps.offering.state) &&
        !stateProps.user?.is_staff,
    },
    {
      label: translate('Request editing'),
      handler: () => dispatchProps.requestEditing(ownProps.offering),
      visible:
        !ownProps.isPublic &&
        [ACTIVE, PAUSED].includes(ownProps.offering.state) &&
        !stateProps.user?.is_staff,
    },
    {
      label: translate('Set location'),
      handler: () => dispatchProps.setLocation(ownProps.offering),
      visible:
        !ownProps.isPublic &&
        ![ARCHIVED].includes(ownProps.offering.state) &&
        stateProps.user?.is_staff,
    },
    {
      label: translate('Edit confirmation message'),
      handler: () => dispatchProps.editConfirmationMessage(ownProps.offering),
      visible: supportOfferingActionVisible(
        ownProps.offering,
        stateProps.user,
        stateProps.isOwner,
        stateProps.isServiceManager,
      ),
    },
    {
      label: translate('Set access policy'),
      handler: () => dispatchProps.setAccessPolicy(ownProps.offering),
      visible:
        !ownProps.isPublic &&
        isVisible(ownProps.offering.state, stateProps.user?.is_staff),
    },
    {
      label: translate('Update logo'),
      handler: () => dispatchProps.updateLogo(ownProps.offering),
      visible:
        !ownProps.isPublic &&
        (stateProps.user?.is_staff ||
          ([DRAFT, ACTIVE, PAUSED].includes(ownProps.offering.state) &&
            (stateProps.isOwner || stateProps.isServiceManager))),
    },
  ].filter((offering) => offering.visible),
});

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const OfferingEditActions = enhance(ActionsDropdown);
