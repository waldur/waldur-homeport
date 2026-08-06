import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { User } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { WideImageField } from '@/form/WideImageField';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { CompactActionButton } from '@/table/CompactActionButton';
import { useUser } from '@/workspace/hooks';

import { useUpdateUser } from './useUpdateUser';

interface OwnProps {
  user: User;
  disabled?: boolean;
  disabledReason?: string;
}

export const UserEditAvatarFormItem: React.FC<OwnProps> = ({
  user,
  disabled,
  disabledReason,
}) => {
  const currentUser = useUser();
  const [image, setImage] = useState(user.image);
  const { callback, isLoading } = useUpdateUser(user);

  return (
    <FormTable.Item
      label={translate('Avatar')}
      description={
        currentUser.uuid === user.uuid
          ? translate('Upload an image to personalize your account profile')
          : translate(
              "Upload an image to personalize the user's account profile",
            )
      }
      disabled={disabled}
      value={
        <WideImageField
          name="image"
          disabled={disabled}
          disabledReason={disabledReason}
          alt={getItemAbbreviation(user, 'full_name')}
          initialValue={user.image}
          max={2 * 1024 * 1024} // 2MB
          size={64}
          input={{ value: image, onChange: (value) => setImage(value) } as any}
          extraActions={({ isChanged, isTooLarge }) =>
            isChanged || isLoading ? (
              <CompactActionButton
                variant="primary"
                iconRight
                disabled={isTooLarge || disabled}
                disabledReason={
                  isTooLarge
                    ? translate('File exceeds 2 MB size limit')
                    : disabledReason
                }
                pending={isLoading}
                action={() => callback({ image })}
                title={translate('Save')}
                iconNode={<UploadSimpleIcon weight="bold" />}
              />
            ) : null
          }
        />
      }
    />
  );
};
