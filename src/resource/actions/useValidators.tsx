import { useMemo } from 'react';

import { ActionValidator } from '@/resource/actions/types';
import { parseValidators } from '@/resource/actions/utils';
import { useUser } from '@/workspace/hooks';

export const useValidators: <T>(
  validators: ActionValidator<T>[],
  resource: T,
) => { tooltip: string; disabled: boolean } = (validators, resource) => {
  const user = useUser();
  return useMemo(() => {
    const tooltip = parseValidators(validators, { user, resource });
    const disabled = tooltip !== undefined;
    return { tooltip, disabled };
  }, [validators, resource, user]);
};
