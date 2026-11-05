import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { setImpersonatorUser } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

import {
  UsersService,
  clearImpersonationData,
  setImpersonationData,
} from '../UsersService';

export const useImpersonate = (targetUserUuid: string) => {
  const user = useUser();
  const dispatch = useDispatch();

  const { showErrorResponse } = useNotify();

  const { mutateAsync: impersonate, isPending } = useMutation({
    // Resolves to whether impersonation started, so that callers do not carry
    // on as the impersonated user after a refusal.
    mutationFn: async () => {
      try {
        setImpersonationData(targetUserUuid);
        dispatch(setImpersonatorUser(user));
        await UsersService.refreshCurrentUser();
        return true;
      } catch (error) {
        // Otherwise the header stays in storage and every later request,
        // including the next page load, fails the same way.
        clearImpersonationData();
        showErrorResponse(error, translate('Unable to impersonate the user.'));
        return false;
      }
    },
  });

  return { impersonate, isPending };
};
