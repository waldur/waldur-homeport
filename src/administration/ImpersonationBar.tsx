import { EyeSlashIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { BaseButton } from 'waldur-ui';

import { getHeaders } from '@/core/api';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useNotify } from '@/store/notify';
import { UsersService, clearImpersonationData } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';
import { getImpersonatorUser } from '@/workspace/selectors';
import './ImpersonationBar.scss';

export const ImpersonationBar = () => {
  const user = useUser();
  const impersonatorUser = useSelector(getImpersonatorUser);

  const { showErrorResponse } = useNotify();
  const { mutate: stop, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        clearImpersonationData();
        await UsersService.refreshCurrentUser({ headers: getHeaders(false) });
      } catch (error) {
        showErrorResponse(error, translate('Unable to stop impersonating.'));
      }
    },
  });

  if (!impersonatorUser || !user) {
    return null;
  }

  return (
    <div
      className={classNames(
        PAGE_CONTAINER_CLASSNAME,
        'impersonation-bar flex items-center justify-between h-full gap-3',
      )}
    >
      <div className="flex items-center self-stretch gap-3 font-medium">
        <div className="icon">
          <WarningCircleIcon size={20} weight="bold" />
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
      </div>
      <BaseButton
        variant="secondary"
        onClick={() => stop()}
        disabled={isLoading}
        disabledReason={translate('Stopping...')}
        iconNode={<EyeSlashIcon size={20} weight="bold" />}
        label={translate('Stop impersonating')}
      />
    </div>
  );
};
