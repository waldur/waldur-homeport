import { FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Tab,
  Tabs,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { createSelector } from 'reselect';

import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import { UserChecklist } from '@waldur/marketplace-checklist/UserChecklist';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
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
  const [{ loading, value }, callback] = useAsyncFn(async () => {
    let user;
    if (resolve.user_uuid) {
      user = await getUser(resolve.user_uuid);
    } else {
      user = resolve.user;
    }
    const checklistCount = await countChecklists();
    return { user, checklistCount };
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
        ) : value?.user ? (
          <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
            <Tab eventKey={1} title={translate('Details')}>
              <div className="m-t-sm">
                <UserDetailsTable user={value.user} />
              </div>
            </Tab>

            {canSeeChecklist && value.checklistCount ? (
              <Tab eventKey={2} title={translate('Checklists')}>
                <div className="m-t-sm">
                  <UserChecklist userId={value.user.uuid} readOnly={true} />
                </div>
              </Tab>
            ) : null}
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
