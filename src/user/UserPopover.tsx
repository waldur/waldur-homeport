import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import { useSelector } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { createSelector } from 'reselect';

import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FEATURE as CHECKLIST_FEATURE } from '@waldur/marketplace-checklist/constants';
import { UserChecklist } from '@waldur/marketplace-checklist/UserChecklist';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { isVisible } from '@waldur/store/config';
import { isSupport, isStaff, isOwner } from '@waldur/workspace/selectors';

import { UserDetailsTable } from './support/UserDetailsTable';

const getUser = (userId) => getById('/users/', userId);

const canSeeChecklist = (state) => isVisible(state, CHECKLIST_FEATURE);

const getCanSeeChecklist = createSelector(
  isSupport,
  isStaff,
  isOwner,
  canSeeChecklist,
  (support, staff, owner, checklist) =>
    checklist && (support || staff || owner),
);

export const UserPopover = ({ resolve }) => {
  const [{ loading, value: user }, callback] = useAsyncFn(async () => {
    if (resolve.user_uuid) {
      const user = await getUser(resolve.user_uuid);
      return user;
    } else {
      return resolve.user;
    }
  }, [resolve]);

  useEffectOnce(() => {
    callback();
  });

  const canSeeChecklist = useSelector(getCanSeeChecklist);

  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('User details')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <LoadingSpinner />
        ) : user ? (
          <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
            <Tab eventKey={1} title={translate('Details')}>
              <div className="m-t-sm">
                <UserDetailsTable user={user} />
              </div>
            </Tab>

            {canSeeChecklist && (
              <Tab eventKey={2} title={translate('Checklists')}>
                <div className="m-t-sm">
                  <UserChecklist userId={user.uuid} readOnly={true} />
                </div>
              </Tab>
            )}
          </Tabs>
        ) : (
          <>
            <p>{translate('Unable to load user.')}</p>
            <button
              type="button"
              className="btn btn-default"
              onClick={callback}
            >
              <i className="fa fa-refresh"></i> {translate('Try again')}
            </button>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
