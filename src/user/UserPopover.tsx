import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { UserDetailsTable } from './support/UserDetailsTable';

const getUser = userId => getById('/users/', userId);

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
  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('User details')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <LoadingSpinner />
        ) : user ? (
          <UserDetailsTable user={user} />
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
