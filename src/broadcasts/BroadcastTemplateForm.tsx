import { FC } from 'react';

import { required } from '@/core/validators';
import { StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';

export const BroadcastTemplateForm: FC = () => {
  return (
    <div className="scroll-y">
      <StringGroup
        name="name"
        label={translate('Name')}
        required={true}
        validate={required}
        maxLength={150}
      />
      <StringGroup
        name="subject"
        label={translate('Subject')}
        required={true}
        validate={required}
      />
      <TextGroup
        name="body"
        label={translate('Message')}
        required={true}
        validate={required}
      />
    </div>
  );
};
