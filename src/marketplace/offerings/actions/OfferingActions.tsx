import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { googleCalendarActions } from '@waldur/marketplace/offerings/actions/GoogleCalendarActions';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';
import { getUser, isOwner } from '@waldur/workspace/selectors';

import {
  addOfferingLocation,
  googleCalendarPublish,
  googleCalendarSync,
  googleCalendarUnpublish,
  updateOfferingState,
} from '../store/actions';
import { DRAFT, ACTIVE, ARCHIVED, PAUSED } from '../store/constants';

import { ActionsDropdown } from './ActionsDropdown';

const SetLocationDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SetLocationDialog" */ '@waldur/map/SetLocationDialog'
    ),
  'SetLocationDialog',
);
const RequestActionDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RequestActionDialog" */ '@waldur/marketplace/offerings/actions/RequestActionDialog'
    ),
  'RequestActionDialog',
);
const PauseOfferingDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PauseOfferingDialog" */ './PauseOfferingDialog'
    ),
  'PauseOfferingDialog',
);
const UpdateOfferingAttributesDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateOfferingAttributesDialog" */ './UpdateOfferingAttributesDialog'
    ),
  'UpdateOfferingAttributesDialog',
);

interface OwnProps {
  offering: Offering;
}

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  isOwner: isOwner(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateOfferingState: (offering: Offering, stateAction, reason?) => {
    dispatch(updateOfferingState(offering, stateAction, reason));
  },
  pauseOffering: (offering: Offering) =>
    dispatch(
      openModalDialog(PauseOfferingDialog, {
        resolve: { offering },
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
            dispatch(addOfferingLocation(offeringData)),
        },
        size: 'lg',
      }),
    ),
  updateAttributes: (offering: Offering) =>
    dispatch(
      openModalDialog(UpdateOfferingAttributesDialog, {
        resolve: {
          offering,
        },
        size: 'lg',
      }),
    ),
  syncGoogleCalendar: (offering: Offering) =>
    dispatch(googleCalendarSync(offering.uuid)),
  publishGoogleCalendar: (offering: Offering) =>
    dispatch(googleCalendarPublish(offering.uuid)),
  unpublishGoogleCalendar: (offering: Offering) =>
    dispatch(googleCalendarUnpublish(offering.uuid)),
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
        dispatchProps.updateOfferingState(ownProps.offering, 'activate');
      },
      visible:
        [DRAFT, PAUSED].includes(ownProps.offering.state) &&
        stateProps.user.is_staff,
    },
    {
      label: translate('Pause'),
      handler: () => dispatchProps.pauseOffering(ownProps.offering),
      visible: ownProps.offering.state === ACTIVE,
    },
    {
      label: translate('Unpause'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.offering, 'unpause');
      },
      visible: ownProps.offering.state === PAUSED,
    },
    {
      label: translate('Archive'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.offering, 'archive');
      },
      visible: ownProps.offering.state !== ARCHIVED,
    },
    {
      label: translate('Set to draft'),
      handler: () => {
        dispatchProps.updateOfferingState(ownProps.offering, 'draft');
      },
      visible: ownProps.offering.state !== DRAFT && stateProps.user.is_staff,
    },
    {
      label: translate('Edit'),
      handler: () =>
        router.stateService.go('marketplace-offering-update', {
          offering_uuid: ownProps.offering.uuid,
        }),
      visible:
        ownProps.offering.state !== ARCHIVED &&
        (ownProps.offering.state === DRAFT || stateProps.user.is_staff),
    },
    {
      label: translate('Edit attributes'),
      handler: () => dispatchProps.updateAttributes(ownProps.offering),
      visible: ownProps.offering.state !== ARCHIVED && ownProps.offering.shared,
    },
    {
      label: translate('Screenshots'),
      handler: () =>
        router.stateService.go('marketplace-offering-screenshots', {
          offering_uuid: ownProps.offering.uuid,
        }),
      visible:
        ownProps.offering.state !== ARCHIVED &&
        (ownProps.offering.state === DRAFT || stateProps.user.is_staff),
    },
    {
      label: translate('Request publishing'),
      handler: () => dispatchProps.requestPublishing(ownProps.offering),
      visible:
        [DRAFT].includes(ownProps.offering.state) && !stateProps.user.is_staff,
    },
    {
      label: translate('Request editing'),
      handler: () => dispatchProps.requestEditing(ownProps.offering),
      visible:
        [ACTIVE, PAUSED].includes(ownProps.offering.state) &&
        !stateProps.user.is_staff,
    },
    {
      label: translate('Set location'),
      handler: () => dispatchProps.setLocation(ownProps.offering),
      visible:
        ![ARCHIVED].includes(ownProps.offering.state) &&
        stateProps.user.is_staff,
    },
    ...googleCalendarActions(dispatchProps, ownProps, stateProps),
  ].filter((offering) => offering.visible),
});

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const OfferingActions = enhance(ActionsDropdown);
