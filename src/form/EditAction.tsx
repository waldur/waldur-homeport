import { PencilSimpleIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

export const EditAction = (props) => {
  return (
    <ActionItem
      title={props.title || translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      {...props}
    />
  );
};
