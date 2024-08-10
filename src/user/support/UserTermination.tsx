import { Trash } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Panel } from '@waldur/core/Panel';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';
import { User, UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';
import { TermsOfService } from './TermsOfService';

interface UserTerminationProps {
  currentUser: User;
  user: UserDetails;
  onToggleUserStatus: () => Promise<any>;
  onDeleteUser: () => Promise<any>;
}

const getConfirmationText = (isActive, name) => {
  return isActive
    ? translate(
        'Are you sure you want to deactivate {name}?',
        { name: <strong>{name}</strong> },
        formatJsxTemplate,
      )
    : translate(
        'Are you sure you want to activate {name}?',
        { name: <strong>{name}</strong> },
        formatJsxTemplate,
      );
};

const PureUserTermination = (props: UserTerminationProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isActive, setIsActive] = useState(props.user.is_active);

  const performDeleteUser = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete {name}?',
          { name: <strong>{props.user.full_name}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    props.onDeleteUser().then(() => {
      if (isDescendantOf('marketplace-provider', router.globals.current)) {
        router.stateService.go('marketplace-provider-users');
      } else {
        router.stateService.go('admin-user-users');
      }
    });
  };

  const toggleUserStatus = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        getConfirmationText(isActive, props.user.full_name),
      );
    } catch {
      return;
    }
    setIsActive(!isActive);
    props.onToggleUserStatus();
  };

  return props.currentUser.is_staff ? (
    <>
      <Panel
        title={translate('Delete account')}
        className="card-bordered mb-5"
        actions={
          <Button variant="light-danger" onClick={performDeleteUser}>
            <span className="svg-icon svg-icon-2">
              <Trash weight="bold" />
            </span>
            {translate('Delete')}
          </Button>
        }
      >
        <ul className="text-grey-500 mb-7">
          {props.user.agreement_date && (
            <li>
              <TermsOfService agreementDate={props.user.agreement_date} />
            </li>
          )}
          <li>{translate('Permanently delete user account.')}</li>
          <li>{translate('This action cannot be undone.')}</li>
        </ul>
      </Panel>
      <Panel
        title={translate('Account status')}
        className="card-bordered"
        actions={
          <AwesomeCheckbox
            value={!isActive}
            onChange={toggleUserStatus}
            label={translate('Block')}
          />
        }
      >
        <ul className="text-grey-500">
          <li>{translate('Temporarily block account')}</li>
          <li>{translate('This action will disable account access')}</li>
          <li>
            {translate(
              'Blocked users are not visible to other non-operator roles',
            )}
          </li>
          <li>{translate('Blocked users cannot login into the system')}</li>
        </ul>
      </Panel>
    </>
  ) : null;
};

const mapStatToProps = (state: RootState) => ({
  currentUser: getUser(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onToggleUserStatus: () => {
    if (ownProps.user.is_active) {
      return actions.deactivateUser(ownProps.user, dispatch);
    } else {
      return actions.activateUser(ownProps.user, dispatch);
    }
  },
  onDeleteUser: () => {
    return actions.deleteUser(ownProps.user, dispatch);
  },
});

const enhance = connect(mapStatToProps, mapDispatchToProps);

export const UserTermination = enhance(PureUserTermination);
