import { PlusCircle } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const AddButton = (props) => {
  return (
    <ActionButton
      title={translate('Add')}
      iconNode={<PlusCircle />}
      variant="primary"
      {...props}
    />
  );
};
