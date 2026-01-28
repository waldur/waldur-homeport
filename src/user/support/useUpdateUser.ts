import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

export const useUpdateUser = (user: User) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useSelector(getUser) as any;

  const { showErrorResponse, showSuccess } = useNotify();

  const callback = async (data) => {
    setIsLoading(true);
    try {
      // Only use FormData when uploading an image file
      const hasImageFile = data.image instanceof File;

      const body = {
        ...data,
        agree_with_policy: true,
        image: hasImageFile ? fileSerializer(data.image) : undefined,
        token_lifetime:
          'token_lifetime' in data && data.token_lifetime
            ? data.token_lifetime.value
            : undefined,
      };

      const { data: newUser } = await usersPartialUpdate({
        path: { uuid: user.uuid },
        body,
        ...(hasImageFile ? formDataOptions : {}),
      });
      if (newUser.uuid === currentUser.uuid) {
        dispatch(setCurrentUser(newUser));
      }
      showSuccess(translate('User has been updated'));
    } catch (error) {
      showErrorResponse(error, translate('User could not be updated'));
    } finally {
      setIsLoading(false);
    }
  };

  return { callback, isLoading };
};
