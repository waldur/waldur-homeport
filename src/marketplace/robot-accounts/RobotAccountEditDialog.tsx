import { marketplaceRobotAccountsPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

import {
  RobotAccountFormData,
  useRobotAccountFields,
} from './CreateRobotAccountDialog';

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
        keys: resource.keys ? resource.keys.join('\n') : [],
        responsible_user: resource.responsible_user,
      }}
      updateResource={(id, formData: RobotAccountFormData) =>
        marketplaceRobotAccountsPartialUpdate({
          path: { uuid: id },
          body: {
            ...formData,
            keys: formData.keys ? formData.keys.trim().split(/\r?\n/) : [],
            users: formData.users?.map(({ url }) => url),
            responsible_user: formData.responsible_user?.url || '',
          },
        })
      }
      verboseName={translate('robot account')}
      refetch={refetch}
    />
  );
};
