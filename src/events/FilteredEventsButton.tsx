import { BookOpenTextIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton, ButtonVariant, ButtonSize } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const FilteredEventsDialog = lazyComponent(() =>
  import('./FilteredEventsDialog').then((module) => ({
    default: module.FilteredEventsDialog,
  })),
);

interface FilteredEventsButtonProps {
  filter: any;
  asDropdownItem?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
}

export const FilteredEventsButton: FC<FilteredEventsButtonProps> = ({
  filter,
  asDropdownItem = false,
  size = 'lg',
  variant = 'secondary',
  className,
}) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(FilteredEventsDialog, {
      size: 'xl',
      filter,
    });

  return asDropdownItem ? (
    <ActionItem
      title={translate('History log')}
      action={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
      className={className}
    />
  ) : (
    <BaseButton
      label={translate('History log')}
      onClick={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
      variant={variant}
      size={size}
      className={className}
    />
  );
};
