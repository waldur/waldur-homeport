import { PencilSimpleIcon, UserPlusIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  GenderEnum,
  User,
  usersChangePassword,
  usersCreate,
  usersPartialUpdate,
  usersRemovePassword,
  UserRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { ProgressStep, Wizard } from '@/wizard';
import { useUser, useSetUser } from '@/workspace/hooks';

import { parseGender } from './aai-constants';
import { AccountStep } from './create-user-steps/AccountStep';
import { IdentityStep } from './create-user-steps/IdentityStep';
import { PersonalInfoStep } from './create-user-steps/PersonalInfoStep';
import { ReviewStep } from './create-user-steps/ReviewStep';

export interface UserFormData {
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_support: boolean;
  can_use_personal_access_tokens: boolean;
  first_name?: string;
  last_name?: string;
  native_name?: string;
  organization?: string;
  job_title?: string;
  phone_number?: string;
  description?: string;
  personal_title?: string;
  gender?: GenderEnum;
  place_of_birth?: string;
  country_of_residence?: string;
  nationality?: string;
  nationalities?: string[];
  organization_country?: string;
  organization_type?: string;
  organization_registry_code?: string;
  password?: string;
  remove_password?: boolean;
}

export interface UserFormDialogData {
  editMode: boolean;
  user?: User;
}

interface UserFormDialogProps {
  resolve: {
    user?: User;
    refetch?: () => void;
  };
}

const steps: ProgressStep[] = [
  { key: 'account', label: translate('Account'), completed: false },
  {
    key: 'personal',
    label: translate('Personal information'),
    completed: false,
  },
  { key: 'identity', label: translate('Identity & Profile'), completed: false },
  { key: 'review', label: translate('Review'), completed: false },
];

const wizardForms = [AccountStep, PersonalInfoStep, IdentityStep, ReviewStep];

const buildBody = (formData: UserFormData): UserRequest => {
  const body: UserRequest = {
    username: formData.username,
    email: formData.email,
    is_active: formData.is_active,
    is_staff: formData.is_staff,
    is_support: formData.is_support,
    can_use_personal_access_tokens: formData.can_use_personal_access_tokens,
  };

  // Include optional string fields — send empty string to clear
  body.first_name = formData.first_name || '';
  body.last_name = formData.last_name || '';
  body.native_name = formData.native_name || '';
  body.organization = formData.organization || '';
  body.job_title = formData.job_title || '';
  body.phone_number = formData.phone_number || '';
  body.description = formData.description || '';
  body.personal_title = formData.personal_title || '';
  body.place_of_birth = formData.place_of_birth || '';
  body.country_of_residence = formData.country_of_residence || '';
  body.nationality = formData.nationality || '';
  body.nationalities = formData.nationalities || [];
  body.organization_country = formData.organization_country || '';
  body.organization_type = formData.organization_type || '';
  body.organization_registry_code = formData.organization_registry_code || '';

  if (formData.gender !== undefined && formData.gender !== null) {
    body.gender = formData.gender;
  }

  return body;
};

export const UserFormDialog: FC<UserFormDialogProps> = ({
  resolve: { user, refetch },
}) => {
  const setCurrentUser = useSetUser();
  const currentUser = useUser();
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const editMode = Boolean(user);

  const onSubmit = useCallback(
    async (formData: UserFormData) => {
      try {
        let targetUuid: string;

        if (editMode) {
          const { data: updatedUser } = await usersPartialUpdate({
            path: { uuid: user.uuid },
            body: buildBody(formData),
          });
          targetUuid = updatedUser.uuid;
          if (updatedUser.uuid === currentUser?.uuid) {
            setCurrentUser(updatedUser);
          }
          showSuccess(translate('User has been updated.'));
        } else {
          const { data: createdUser } = await usersCreate({
            body: buildBody(formData),
          });
          targetUuid = createdUser.uuid;
          showSuccess(translate('User has been created.'));
        }

        // Handle password operations after user create/update
        try {
          if (formData.remove_password && editMode) {
            await usersRemovePassword({ path: { uuid: targetUuid } });
          } else if (formData.password) {
            await usersChangePassword({
              path: { uuid: targetUuid },
              body: { new_password: formData.password },
            });
          }
        } catch (passwordError) {
          showErrorResponse(
            passwordError,
            translate('User was saved but password could not be updated.'),
          );
          if (refetch) await refetch();
          closeDialog();
          return;
        }

        if (refetch) {
          await refetch();
        }
        closeDialog();
      } catch (e) {
        showErrorResponse(
          e,
          editMode
            ? translate('Unable to update user.')
            : translate('Unable to create user.'),
        );
      }
    },
    [
      editMode,
      user,
      currentUser,
      showSuccess,
      showErrorResponse,
      closeDialog,
      refetch,
    ],
  );

  const initialValues = useMemo<Partial<UserFormData>>(() => {
    if (user) {
      return {
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_support: user.is_support,
        can_use_personal_access_tokens: user.can_use_personal_access_tokens,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        native_name: user.native_name || '',
        organization: user.organization || '',
        job_title: user.job_title || '',
        phone_number: user.phone_number || '',
        description: user.description || '',
        personal_title: user.personal_title || '',
        gender: parseGender(user.gender),
        place_of_birth: user.place_of_birth || '',
        country_of_residence: user.country_of_residence || '',
        nationality: user.nationality || '',
        nationalities: (user.nationalities as string[]) || [],
        organization_country: user.organization_country || '',
        organization_type: user.organization_type || '',
        organization_registry_code: user.organization_registry_code || '',
      };
    }
    return {
      is_active: true,
      is_staff: false,
      is_support: false,
      can_use_personal_access_tokens: false,
    };
  }, [user]);

  const data: UserFormDialogData = { editMode, user };

  return (
    <Wizard<UserFormData>
      title={editMode ? translate('Edit user') : translate('Create user')}
      subtitle={
        editMode
          ? translate('Update user account details.')
          : translate('Fill in the details to create a new user account.')
      }
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={onSubmit}
      submitLabel={editMode ? translate('Save') : translate('Create')}
      initialValues={initialValues}
      data={data}
      modalProps={{
        iconNode: editMode ? (
          <PencilSimpleIcon weight="bold" />
        ) : (
          <UserPlusIcon weight="bold" />
        ),
        iconColor: 'success',
      }}
    />
  );
};
