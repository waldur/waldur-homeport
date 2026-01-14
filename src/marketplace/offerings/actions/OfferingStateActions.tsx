import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsActivate,
  marketplaceProviderOfferingsArchive,
  marketplaceProviderOfferingsDraft,
  marketplaceProviderOfferingsUnpause,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

import {
  ACTIVE,
  ARCHIVED,
  DRAFT,
  PAUSED,
  UNAVAILABLE,
} from '../store/constants';

const RequestActionDialog = lazyComponent(() =>
  import('@waldur/marketplace/offerings/actions/RequestActionDialog').then(
    (module) => ({ default: module.RequestActionDialog }),
  ),
);

const PauseOfferingDialog = lazyComponent(() =>
  import('./PauseOfferingDialog').then((module) => ({
    default: module.PauseOfferingDialog,
  })),
);

const ChangeOfferingAvailabilityDialog = lazyComponent(() =>
  import('./ChangeOfferingAvailabilityDialog').then((module) => ({
    default: module.ChangeOfferingAvailabilityDialog,
  })),
);

export const OfferingStateActions = ({
  offering,
  refreshOffering,
  className = undefined,
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const updateOfferingState = async (api) => {
    try {
      await api();
      if (refreshOffering) {
        refreshOffering();
      }
      dispatch(showSuccess(translate('Offering state has been updated.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update offering state.')),
      );
    }
  };
  const activate = () => {
    if (user.is_staff) {
      updateOfferingState(() =>
        marketplaceProviderOfferingsActivate({ path: { uuid: offering.uuid } }),
      );
    } else {
      dispatch(
        openModalDialog(RequestActionDialog, {
          resolve: { offering, offeringRequestMode: 'publishing' },
        }),
      );
    }
  };
  const setDraft = () => {
    if (user.is_staff) {
      updateOfferingState(() =>
        marketplaceProviderOfferingsDraft({ path: { uuid: offering.uuid } }),
      );
    } else {
      dispatch(
        openModalDialog(RequestActionDialog, {
          resolve: { offering, offeringRequestMode: 'editing' },
        }),
      );
    }
  };
  const pause = () => {
    dispatch(
      openModalDialog(PauseOfferingDialog, {
        resolve: { offering, refreshOffering },
      }),
    );
  };

  const unpause = () =>
    updateOfferingState(() =>
      marketplaceProviderOfferingsUnpause({ path: { uuid: offering.uuid } }),
    );

  const archive = () =>
    updateOfferingState(() =>
      marketplaceProviderOfferingsArchive({ path: { uuid: offering.uuid } }),
    );

  const openChangeAvailabilityDialog = () => {
    dispatch(
      openModalDialog(ChangeOfferingAvailabilityDialog, {
        resolve: { offering, refetch: refreshOffering },
        size: 'lg',
      }),
    );
  };

  const draftTitle = user.is_staff
    ? translate('Set to draft')
    : translate('Request editing');

  const activateTitle = user.is_staff
    ? translate('Activate')
    : translate('Request publishing');

  const title = {
    [DRAFT]: activateTitle,
    [ACTIVE]: translate('Pause'),
    [PAUSED]: translate('Unpause'),
    [ARCHIVED]: draftTitle,
  }[offering.state];

  const callback = {
    [DRAFT]: activate,
    [ACTIVE]: pause,
    [PAUSED]: unpause,
    [ARCHIVED]: setDraft,
  }[offering.state];

  if (offering.state == UNAVAILABLE) {
    if (!user.is_staff) return null;

    return (
      <Button
        variant="tertiary"
        onClick={openChangeAvailabilityDialog}
        className={className}
      >
        <span className="svg-icon svg-icon-2">
          <ArrowClockwiseIcon weight="bold" />
        </span>
        {translate('Restore')}
      </Button>
    );
  }
  if (offering.state == ARCHIVED) {
    return (
      <ActionButton
        variant="tertiary"
        action={() => setDraft()}
        className={className}
        title={draftTitle}
      />
    );
  }
  return (
    <Dropdown as={ButtonGroup} className={className}>
      <ActionButton variant="primary" action={() => callback()} title={title} />
      <Dropdown.Toggle split variant="primary" className="px-4" />
      <Dropdown.Menu>
        {offering.state !== DRAFT && (
          <Dropdown.Item onClick={() => setDraft()}>{draftTitle}</Dropdown.Item>
        )}

        <Dropdown.Item onClick={() => archive()}>
          {translate('Archive')}
        </Dropdown.Item>

        {user.is_staff && (
          <Dropdown.Item onClick={openChangeAvailabilityDialog}>
            {translate('Make unavailable')}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
