import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { setImpersonatorUser } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

import { UsersService, setImpersonationData } from '../UsersService';

export const useImpersonate = (targetUserUuid: string) => {
  const user = useUser();
  const dispatch = useDispatch();

  const { showErrorResponse } = useNotify();

  const { mutateAsync: impersonate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        setImpersonationData(targetUserUuid);
        dispatch(setImpersonatorUser(user));
        await UsersService.refreshCurrentUser();
      } catch (error) {
        showErrorResponse(error, translate('Unable to impersonate the user.'));
      }
    },
  });

  return { impersonate, isPending };
};
