import { FC, useMemo } from 'react';
import { ProviderSupportUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import { useCreateSupportUser, useUpdateSupportUser } from '../api';
import { PROVIDER_ROLE_OPTIONS } from '../common/roles';

interface OwnProps {
  resolve: {
    helpdeskUuid: string;
    user?: ProviderSupportUser;
    refetch: () => void;
  };
}

export const SupportUserDialog: FC<OwnProps> = ({
  resolve: { helpdeskUuid, user, refetch },
}) => {
  const isEdit = Boolean(user);
  const createMutation = useCreateSupportUser(refetch);
  const updateMutation = useUpdateSupportUser(refetch);

  const handleSubmit = async (formData) => {
    const role = formData.role?.value ?? formData.role;
    const max_open_tickets = formData.max_open_tickets
      ? Number(formData.max_open_tickets)
      : undefined;
    if (isEdit) {
      await updateMutation.mutateAsync({
        uuid: user!.uuid,
        body: { role, max_open_tickets, is_active: formData.is_active },
      });
    } else {
      await createMutation.mutateAsync({
        user: formData.user.url,
        provider_helpdesk: helpdeskUuid,
        role,
        max_open_tickets,
      });
    }
  };

  const fields = useMemo(() => {
    const list: any[] = [];
    if (!isEdit) {
      list.push({
        name: 'user',
        label: translate('User'),
        type: 'async_select',
        loadOptions: userAutocomplete,
        getOptionLabel: ({ full_name, email, username }) =>
          full_name || email || username,
        required: true,
      });
    }
    list.push({
      name: 'role',
      label: translate('Role'),
      type: 'select',
      options: PROVIDER_ROLE_OPTIONS,
      required: true,
    });
    list.push({
      name: 'max_open_tickets',
      label: translate('Max open tickets'),
      type: 'integer',
    });
    if (isEdit) {
      list.push({
        name: 'is_active',
        label: translate('Active'),
        type: 'boolean',
      });
    }
    return list;
  }, [isEdit]);

  const initialValues = useMemo(
    () =>
      isEdit
        ? {
            // simpleValue select: seed the scalar or it renders blank on edit.
            role: user!.role,
            max_open_tickets: user!.max_open_tickets,
            is_active: user!.is_active,
          }
        : { role: PROVIDER_ROLE_OPTIONS[0].value },
    [isEdit, user],
  );

  return (
    <ResourceActionDialog
      dialogTitle={
        isEdit ? translate('Edit team member') : translate('Add team member')
      }
      dialogSubtitle={
        isEdit ? (
          <ScopeSubtitle
            label={translate('Team member')}
            name={user!.user_full_name}
          />
        ) : undefined
      }
      formFields={fields}
      initialValues={initialValues}
      submitForm={handleSubmit}
    />
  );
};
