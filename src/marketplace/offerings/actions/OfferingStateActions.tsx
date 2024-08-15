import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateOfferingState as updateOfferingStateApi } from '@waldur/marketplace/common/api';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { ACTIVE, ARCHIVED, DRAFT, PAUSED } from '../store/constants';

const RequestActionDialog = lazyComponent(
  () => import('@waldur/marketplace/offerings/actions/RequestActionDialog'),
  'RequestActionDialog',
);

const PauseOfferingDialog = lazyComponent(
  () => import('./PauseOfferingDialog'),
  'PauseOfferingDialog',
);

export const OfferingStateActions = ({ offering, refreshOffering }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const updateOfferingState = async (target, reason = null) => {
    try {
      await updateOfferingStateApi(offering.uuid, target, reason);
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
      updateOfferingState('activate');
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
      updateOfferingState('draft');
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

  const unpause = () => updateOfferingState('unpause');

  const archive = () => updateOfferingState('archive');

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

  if (offering.state == ARCHIVED) {
    return (
      <Button variant="light" onClick={() => setDraft()}>
        {draftTitle}
      </Button>
    );
  }
  return (
    <Dropdown as={ButtonGroup}>
      <Button variant="primary" onClick={() => callback()}>
        {title}
      </Button>
      <Dropdown.Toggle split variant="primary" className="px-4" />
      <Dropdown.Menu>
        {offering.state !== DRAFT && (
          <Dropdown.Item onClick={() => setDraft()}>{draftTitle}</Dropdown.Item>
        )}

        <Dropdown.Item onClick={() => archive()}>
          {translate('Archive')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
