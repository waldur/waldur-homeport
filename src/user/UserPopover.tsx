import { FunctionComponent } from 'react';
import { Button, Card, Modal, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getProfile } from '@waldur/freeipa/api';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import { UserChecklist } from '@waldur/marketplace-checklist/UserChecklist';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { KeysList } from '@waldur/user/keys/KeysList';
import { isSupport, isStaff, isOwner } from '@waldur/workspace/selectors';

import { UserDetailsTable } from './support/UserDetailsTable';

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
        <i className="fa fa-refresh"></i> {translate('Try again')}
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
        <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
          <Tab eventKey={1} title={translate('Details')}>
            <Card>
              <UserDetailsTable user={value.user} profile={value.profile} />
            </Card>
          </Tab>

          {canSeeChecklist && value.checklistCount ? (
            <Tab eventKey={2} title={translate('Checklists')}>
              <Card>
                <UserChecklist userId={value.user.uuid} readOnly={true} />
              </Card>
            </Tab>
          ) : null}

          <Tab eventKey={3} title={translate('Keys')}>
            <Card>
              <KeysList user={value.user} />
            </Card>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton label={translate('Close')} />
      </Modal.Footer>
    </Modal>
  ) : null;
};
