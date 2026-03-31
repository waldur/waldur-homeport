import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsActivate,
  marketplaceProviderOfferingsArchive,
  marketplaceProviderOfferingsDestroy,
  marketplaceProviderOfferingsDraft,
  marketplaceProviderOfferingsUnpause,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';
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

const getActivationErrors = (offering): string[] => {
  const errors: string[] = [];
  if (!offering.plans?.length) {
    errors.push(translate('Offering must have at least one plan.'));
  }
  if (
    offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS &&
    !offering.secret_options?.create
  ) {
    errors.push(translate('Script is not defined.'));
  }
  return errors;
};

export const OfferingStateActions = ({
  offering,
  refreshOffering,
  className = undefined,
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const router = useRouter();
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
  const canManageOfferingLifecycle =
    user.is_staff ||
    !!ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT;

  const activate = () => {
    const errors = getActivationErrors(offering);
    if (errors.length > 0) {
      errors.forEach((error) => dispatch(showError(error)));
      return;
    }
    if (canManageOfferingLifecycle) {
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
    if (canManageOfferingLifecycle) {
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

  const unpause = () => {
    const errors = getActivationErrors(offering);
    if (errors.length > 0) {
      errors.forEach((error) => dispatch(showError(error)));
      return;
    }
    updateOfferingState(() =>
      marketplaceProviderOfferingsUnpause({ path: { uuid: offering.uuid } }),
    );
  };

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

  const handleDelete = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete offering {name}?', {
          name: offering.name,
        }),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplaceProviderOfferingsDestroy({
        path: { uuid: offering.uuid },
      });
      dispatch(
        showSuccess(
          translate('Offering {name} deleted successfully.', {
            name: offering.name,
          }),
        ),
      );
      router.stateService.go('marketplace-vendor-offerings', {
        uuid: offering.customer_uuid,
      });
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Error while deleting offering {name}.', {
            name: offering.name,
          }),
        ),
      );
    }
  };

  const canDeleteOffering = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: offering.customer_uuid,
  });

  const showDeleteAction = canManageOfferingLifecycle
    ? user.is_staff ||
      (offering.state === DRAFT &&
        !offering.resources_count &&
        canDeleteOffering)
    : false;

  const deletionRestricted =
    offering.plugin_options?.restrict_deletion_with_active_resources &&
    offering.resources_count > 0;

  const draftTitle = canManageOfferingLifecycle
    ? translate('Set to draft')
    : translate('Request editing');

  const activateTitle = canManageOfferingLifecycle
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
    if (!canManageOfferingLifecycle) return null;

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
      <ActionButton
        variant="primary"
        action={() => callback()}
        title={title}
        data-testid="offering-primary-state-action"
      />
      <Dropdown.Toggle split variant="primary" className="px-4" />
      <Dropdown.Menu>
        {offering.state !== DRAFT && (
          <ActionItem
            title={draftTitle}
            action={() => setDraft()}
            iconNode={<PencilSimpleIcon weight="bold" />}
          />
        )}
        <ActionItem
          title={translate('Archive')}
          action={() => archive()}
          iconNode={<ArchiveIcon weight="bold" />}
        />
        {canManageOfferingLifecycle && (
          <ActionItem
            title={translate('Make unavailable')}
            action={openChangeAvailabilityDialog}
            iconNode={<ProhibitIcon weight="bold" />}
          />
        )}
        {showDeleteAction && <div className="separator my-2" />}
        {showDeleteAction && (
          <ActionItem
            title={translate('Delete')}
            action={handleDelete}
            iconNode={<TrashIcon weight="bold" />}
            iconColor="danger"
            className="text-danger"
            disabled={!!deletionRestricted}
            tooltip={
              deletionRestricted
                ? translate(
                    'Offering cannot be deleted while it has active resources.',
                  )
                : undefined
            }
          />
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
