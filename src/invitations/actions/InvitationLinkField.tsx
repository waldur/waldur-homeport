import { FormField, FormLabel } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { getGroupInvitationLink } from '../utils';

export const InvitationLinkField = ({ invitation }) => {
  const link = invitation ? getGroupInvitationLink(invitation) : '';
  return (
    <FormField>
      <FormLabel>{translate('Invitation link')}</FormLabel>
      <div className="flex gap-2">
        <BaseInputField
          value={link}
          placeholder={translate('e.g. https://')}
          readOnly
          solid
        />

        <CopyToClipboardButton
          value={link}
          size={20}
          buttonVariant="text-secondary"
          onlyButton
        />
      </div>
    </FormField>
  );
};
