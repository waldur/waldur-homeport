import { BookOpenTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';

const FilteredEventsDialog = lazyComponent(() =>
  import('./FilteredEventsDialog').then((module) => ({
    default: module.FilteredEventsDialog,
  })),
);

export const FilteredEventsButton = ({ filter, asDropdownItem = false }) => {
  const { openDialog } = useModal();
  const Component = asDropdownItem ? ActionItem : ActionButton;
  return (
    <Component
      title={translate('History log')}
      action={() =>
        openDialog(FilteredEventsDialog, {
          size: 'xl',
          filter,
        })
      }
      iconNode={<BookOpenTextIcon weight="bold" />}
    />
  );
};
