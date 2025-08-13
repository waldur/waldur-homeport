import { BookOpenTextIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MaintenanceHistoryLogAction = ({ row, refetch }) => {
  const callback = () => {
    row & refetch;
  };
  return (
    <ActionItem
      title={translate('History log')}
      action={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
    />
  );
};
