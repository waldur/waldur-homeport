import { translate } from '@waldur/i18n';
import { updateRobotAccount } from '@waldur/marketplace/common/api';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import {
  RobotAccountFormData,
  useRobotAccountFields,
} from '../actions/CreateRobotAccountDialog';

export const RobotAccountEditDialog = ({ resolve: { resource, refetch } }) => {
  const fields = useRobotAccountFields(resource);
  return (
    <UpdateResourceDialog
      fields={fields}
      resource={resource}
      initialValues={{
        type: resource.type,
        username: resource.username,
        users: resource.users,
        keys: resource.keys.join('\n'),
      }}
      updateResource={(id, formData: RobotAccountFormData) =>
        updateRobotAccount(id, {
          ...formData,
          keys: formData.keys?.trim().split(/\r?\n/),
          users: formData.users?.map(({ url }) => url),
        })
      }
      verboseName={translate('robot account')}
      refetch={refetch}
    />
  );
};
