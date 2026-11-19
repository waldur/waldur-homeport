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
  /** Defaults to "History log". */
  title?: string;
  asDropdownItem?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
}

export const FilteredEventsButton: FC<FilteredEventsButtonProps> = ({
  filter,
  title,
  asDropdownItem = false,
  size = 'lg',
  variant = 'secondary',
  className,
}) => {
  const { openDialog } = useModal();

  const label = title ?? translate('History log');
  const callback = () =>
    openDialog(FilteredEventsDialog, {
      size: 'xl',
      filter,
      title: label,
    });

  return asDropdownItem ? (
    <ActionItem
      title={label}
      action={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
      className={className}
    />
  ) : (
    <BaseButton
      label={label}
      onClick={callback}
      iconNode={<BookOpenTextIcon weight="bold" />}
      variant={variant}
      size={size}
      className={className}
    />
  );
};
