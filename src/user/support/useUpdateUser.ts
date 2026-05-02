import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { tryJoinOrganization } from '@/invitations/tryJoinOrganization';
import { useNotify } from '@/store/notify';
import { setCurrentUser } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

export const useUpdateUser = (user: User) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useUser() as any;

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
        // Check if ToS was just accepted (agreement_date changed from null to not-null)
        const tosJustAccepted =
          !currentUser.agreement_date && newUser.agreement_date;

        dispatch(setCurrentUser(newUser));

        // If ToS was just accepted, check for pending group invitation
        if (tosJustAccepted) {
          tryJoinOrganization();
        }
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
