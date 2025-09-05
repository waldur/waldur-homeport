import { translate } from '@waldur/i18n';

export const INVITATION_CREATE_FORM_ID = 'InvitationCreateDialog';
export const GROUP_INVITATION_CREATE_FORM_ID = 'GroupInvitationCreateForm';

export const invitationTypeOptions = [
  {
    label: translate('Private'),
    value: 'private',
    description: translate('A private URL will be generated'),
  },
  {
    label: translate('Public'),
    value: 'public',
    description: translate('Anonymous users can list invitation links'),
  },
];
