import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { getUser } from '@waldur/workspace/selectors';

import { useUpdateUser } from './useUpdateUser';

interface OwnProps {
  user: User;
  disabled?: boolean;
}

export const UserEditAvatarFormItem: React.FC<OwnProps> = ({
  user,
  disabled,
}) => {
  const currentUser = useSelector(getUser);
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
          alt={getItemAbbreviation(user, 'full_name')}
          initialValue={user.image}
          max={2 * 1024 * 1024} // 2MB
          size={64}
          input={{ value: image, onChange: (value) => setImage(value) } as any}
          extraActions={({ isChanged, isTooLarge }) =>
            isChanged || isLoading ? (
              <Button
                variant="primary"
                size="sm"
                className="btn-icon-right"
                disabled={isLoading || isTooLarge || disabled}
                onClick={() => callback({ image })}
              >
                {translate('Save')}
                <span className="svg-icon svg-icon-5">
                  <UploadSimpleIcon />
                </span>
              </Button>
            ) : null
          }
        />
      }
    />
  );
};
