import { BookOpenTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

const FilteredEventsDialog = lazyComponent(() =>
  import('./FilteredEventsDialog').then((module) => ({
    default: module.FilteredEventsDialog,
  })),
);

export const FilteredEventsButton = ({ filter }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('History log')}
      action={() =>
        openDialog(FilteredEventsDialog, {
          size: 'xl',
          filter,
        })
      }
      iconNode={<BookOpenTextIcon />}
    />
  );
};
