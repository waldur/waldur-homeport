import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ActionValidator } from '@waldur/resource/actions/types';
import { parseValidators } from '@waldur/resource/actions/utils';
import { getUser } from '@waldur/workspace/selectors';

export const useValidators: <T>(
  validators: ActionValidator<T>[],
  resource: T,
) => { tooltip: string; disabled: boolean } = (validators, resource) => {
  const user = useSelector(getUser);
  return useMemo(() => {
    const tooltip = parseValidators(validators, { user, resource });
    const disabled = tooltip !== undefined;
    return { tooltip, disabled };
  }, [validators, resource, user]);
};
