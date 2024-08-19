import { ArrowsClockwise } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { getProfile } from '@waldur/freeipa/api';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import { UserChecklist } from '@waldur/marketplace-checklist/UserChecklist';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { KeysList } from '@waldur/user/keys/KeysList';
import { isSupport, isStaff, isOwner } from '@waldur/workspace/selectors';

import { UserDetailsTable } from './support/UserDetailsTable';
import { UserOfferingList } from './UserOfferingList';

const getUser = (userId) => getById('/users/', userId);

const getCanSeeChecklist = createSelector(
  isSupport,
  isStaff,
  isOwner,
  (support, staff, owner) => support || staff || owner,
);

export const UserPopover: FunctionComponent<{ resolve }> = ({ resolve }) => {
  const [{ loading, error, value }, callback] = useAsyncFn(async () => {
    let user;
    if (resolve.user_uuid) {
      user = await getUser(resolve.user_uuid);
    } else {
      user = resolve.user;
    }
    const checklistCount = await countChecklists();
    let profile = null;
    if (ENV.plugins.WALDUR_FREEIPA?.ENABLED) {
      profile = await getProfile(user.uuid);
    }
    return { user, checklistCount, profile };
  }, [resolve]);

  useEffectOnce(() => {
    callback();
  });

  const canSeeChecklist = useSelector(getCanSeeChecklist);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>
      <p>{translate('Unable to load user.')}</p>
      <Button onClick={callback}>
        <span className="svg-icon svg-icon-2">
          <ArrowsClockwise />
        </span>{' '}
        {translate('Try again')}
      </Button>
    </>
  ) : value?.user ? (
    <Modal size="lg" show centered>
      <Modal.Header>
        <Modal.Title>
          {translate('User details for {fullName}', {
            fullName: value.user.full_name,
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey={1} unmountOnExit={true}>
          <Tab eventKey={1} title={translate('Details')}>
            <UserDetailsTable user={value.user} profile={value.profile} />
          </Tab>

          {canSeeChecklist && value.checklistCount ? (
            <Tab eventKey={2} title={translate('Checklists')}>
              <UserChecklist userId={value.user.uuid} readOnly={true} />
            </Tab>
          ) : null}

          {isFeatureVisible(UserFeatures.ssh_keys) ? (
            <Tab eventKey={3} title={translate('Keys')}>
              <KeysList user={value.user} hasActionBar={false} />
            </Tab>
          ) : null}

          <Tab eventKey={4} title={translate('Remote accounts')}>
            <UserOfferingList user={value.user} hasActionBar={false} />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton label={translate('Close')} />
      </Modal.Footer>
    </Modal>
  ) : null;
};
