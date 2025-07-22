import { BookOpenTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionButton } from '@waldur/table/ActionButton';

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
