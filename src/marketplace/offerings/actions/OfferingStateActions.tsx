import { PencilSimpleIcon } from '@phosphor-icons/react';
import type { MouseEvent } from 'react';
import { ButtonGroup, Dropdown } from 'react-bootstrap';
import {
  marketplaceProviderOfferingsActivate,
  marketplaceProviderOfferingsDraft,
  marketplaceProviderOfferingsUnpause,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

import {
  ACTIVE,
  ARCHIVED,
  DRAFT,
  PAUSED,
  UNAVAILABLE,
} from '../store/constants';

import { ArchiveOfferingAction } from './ArchiveOfferingAction';
import { DeleteOfferingAction } from './DeleteOfferingAction';
import { MakeUnavailableAction } from './MakeUnavailableAction';
import { RestoreOfferingAction } from './RestoreOfferingAction';

const RequestActionDialog = lazyComponent(() =>
  import('@/marketplace/offerings/actions/RequestActionDialog').then(
    (module) => ({ default: module.RequestActionDialog }),
  ),
);

const PauseOfferingDialog = lazyComponent(() =>
  import('./PauseOfferingDialog').then((module) => ({
    default: module.PauseOfferingDialog,
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
  const runActionAndBlurOnPointerClick = (
    event: MouseEvent<HTMLElement>,
    action: () => void,
  ) => {
    action();

    // Keep keyboard focus behavior; blur only for pointer interactions.
    if (event.detail > 0) {
      event.currentTarget.blur();
    }
  };

  const { showError, showErrorResponse, showSuccess } = useNotify();

  const { openDialog, closeDialog } = useModal();

  const user = useUser();
  const updateOfferingState = async (api) => {
    try {
      await api();
      if (refreshOffering) {
        refreshOffering();
      }
      showSuccess(translate('Offering state has been updated.'));
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to update offering state.'));
    }
  };
  const canManageOfferingLifecycle =
    user.is_staff ||
    !!ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT;

  const activate = () => {
    const errors = getActivationErrors(offering);
    if (errors.length > 0) {
      errors.forEach((error) => showError(error));
      return;
    }
    if (canManageOfferingLifecycle) {
      updateOfferingState(() =>
        marketplaceProviderOfferingsActivate({ path: { uuid: offering.uuid } }),
      );
    } else {
      openDialog(RequestActionDialog, {
        resolve: { offering, offeringRequestMode: 'publishing' },
      });
    }
  };
  const setDraft = () => {
    if (canManageOfferingLifecycle) {
      updateOfferingState(() =>
        marketplaceProviderOfferingsDraft({ path: { uuid: offering.uuid } }),
      );
    } else {
      openDialog(RequestActionDialog, {
        resolve: { offering, offeringRequestMode: 'editing' },
      });
    }
  };
  const pause = () => {
    openDialog(PauseOfferingDialog, {
      resolve: { offering, refreshOffering },
    });
  };

  const unpause = () => {
    const errors = getActivationErrors(offering);
    if (errors.length > 0) {
      errors.forEach((error) => showError(error));
      return;
    }
    updateOfferingState(() =>
      marketplaceProviderOfferingsUnpause({ path: { uuid: offering.uuid } }),
    );
  };

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
      <RestoreOfferingAction
        offering={offering}
        refreshOffering={refreshOffering}
        className={className}
      />
    );
  }
  if (offering.state == ARCHIVED) {
    return (
      <ActionButton
        variant="tertiary"
        action={(event) => runActionAndBlurOnPointerClick(event, setDraft)}
        className={className}
        title={draftTitle}
      />
    );
  }
  return (
    <Dropdown as={ButtonGroup} className={className}>
      <ActionButton
        variant="primary"
        action={(event) => runActionAndBlurOnPointerClick(event, callback)}
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
        <ArchiveOfferingAction
          offering={offering}
          refreshOffering={refreshOffering}
        />
        <MakeUnavailableAction
          offering={offering}
          refreshOffering={refreshOffering}
          canManageOfferingLifecycle={canManageOfferingLifecycle}
        />
        <DeleteOfferingAction
          offering={offering}
          canManageOfferingLifecycle={canManageOfferingLifecycle}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};
