import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const ConfigurationEditDialog = lazyComponent(() =>
  import('./ConfigurationEditDialog').then((module) => ({
    default: module.ConfigurationEditDialog,
  })),
);

export const ConfigurationEditButton = ({
  item,
  value,
  tooltip,
  warning,
}: {
  item: any;
  value: any;
  tooltip: string;
  // Shown above the field, such as that the next deploy reverts the change.
  warning?: string;
}) => {
  const { openDialog } = useModal();
  // Not memoized: the warning arrives with the setting sources, often after
  // the first render.
  const openFormDialog = () =>
    openDialog(ConfigurationEditDialog, {
      resolve: { item, initialValues: { value }, warning },
      size:
        item.key === 'LOGIN_PAGE_LAYOUT' || item.type === 'markdown_field'
          ? 'lg'
          : 'md',
    });

  return <CompactEditButton onClick={openFormDialog} tooltip={tooltip} />;
};
