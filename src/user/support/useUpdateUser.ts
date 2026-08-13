import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { useRequestToAccessOrganization } from '@/invitations/join-organization/submission';
import { useNotify } from '@/store/notify';
import { useUser, useSetUser } from '@/workspace/hooks';

export const useUpdateUser = (user: User) => {
  const setCurrentUser = useSetUser();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useUser();

  const { showErrorResponse, showSuccess } = useNotify();
  const { request: requestToAccessOrg } = useRequestToAccessOrganization();

  const callback = async (data) => {
    setIsLoading(true);
    try {
      // Only use FormData when uploading an image file
      const hasImageFile = data.image instanceof File;
      // Removing an avatar sends null, which is what the API expects to clear
      // it. Any other non-file value is the existing image URL, which must stay
      // out of the body — echoing it back is rejected as "not a file".
      const isImageRemoval = 'image' in data && data.image === null;

      const body = {
        ...data,
        agree_with_policy: true,
        image: hasImageFile
          ? fileSerializer(data.image)
          : isImageRemoval
            ? null
            : undefined,
        // Deliberately omitted when absent: callers that are not editing the
        // token lifetime must leave the stored value alone, and this field has
        // no "cleared" state in the UI.
        // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body
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

        setCurrentUser(newUser);

        // If ToS was just accepted, check for pending group invitation
        if (tosJustAccepted) {
          const groupToken = GroupInvitationTokenStorage.get();
          if (groupToken) {
            requestToAccessOrg(groupToken);
          }
        }
      }
      // Refresh the cached user so the detail view reflects the new values
      // without a page reload (e.g. staff editing another user's profile,
      // where setCurrentUser above does not apply).
      queryClient.invalidateQueries({ queryKey: ['User', user.uuid] });
      showSuccess(translate('User has been updated'));
    } catch (error) {
      showErrorResponse(error, translate('User could not be updated'));
    } finally {
      setIsLoading(false);
    }
  };

  return { callback, isLoading };
};
