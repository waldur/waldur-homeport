import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { post, getFirst } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';
import { getUser } from '@waldur/workspace/selectors';

const UserEmailChangeCallback = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        await post(`/users/${user.uuid}/confirm_email/`, {code: $state.params.token});
        dispatch(showSuccess(translate('Email has been updated.')));
        const currentUser = await getFirst('/users/', {current: true});
        setSubmitted(true);
        await ngInjector.get('usersService').setCurrentUser(currentUser);
      } catch (error) {
        const errorMessage = `${translate('Unable to change email.')} ${format(error)}`;
        dispatch(showError(errorMessage));
      }
      dispatch(stateGo('profile.manage'));
    }
    if (user && !submitted) {
      load();
    }
  }, [user]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner/>
      <h3 className="app-title centered">{translate('Verifying email change')}</h3>
    </div>
  );
};

export default connectAngularComponent(UserEmailChangeCallback);
