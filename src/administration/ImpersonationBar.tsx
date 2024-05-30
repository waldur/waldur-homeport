import { EyeSlash, WarningCircle } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Stack } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';
import {
  UsersService,
  clearImpersonationData,
} from '@waldur/user/UsersService';
import { getImpersonatorUser, getUser } from '@waldur/workspace/selectors';

import './ImpersonationBar.scss';

export const ImpersonationBar = () => {
  const user = useSelector(getUser);
  const impersonatorUser = useSelector(getImpersonatorUser);

  const dispatch = useDispatch();
  const { mutate: stop, isLoading } = useMutation(async () => {
    try {
      clearImpersonationData();
      await UsersService.getCurrentUser(true);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to stop impersonating.')),
      );
    }
  });

  if (!impersonatorUser || !user) {
    return null;
  }

  return (
    <div className="impersonation-bar d-flex align-items-center justify-content-between h-100 container-fluid gap-4">
      <Stack direction="horizontal" gap={4} className="fw-bold">
        <div className="icon">
          <WarningCircle size={20} weight="bold" />
        </div>
        {translate(
          'Caution! You are impersonating {impersonated}. Logged in as: {impersonator}',
          {
            impersonated: user.full_name,
            impersonator: impersonatorUser.email
              ? `${impersonatorUser.full_name} (${impersonatorUser.email})`
              : impersonatorUser.full_name,
          },
        )}
      </Stack>
      <button
        type="button"
        className="btn btn-active-white"
        onClick={() => stop()}
        disabled={isLoading}
      >
        <EyeSlash size={20} weight="bold" className="me-3" />
        {translate('Stop impersonating')}
      </button>
    </div>
  );
};
