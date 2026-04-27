import { BookOpenTextIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

export const MaintenanceHistoryLogAction = ({ row, refetch }) => {
  const callback = () => {
    if (row) refetch();
  };
  return (
    <ActionItem
      title={translate('History log')}
      action={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
    />
  );
};
