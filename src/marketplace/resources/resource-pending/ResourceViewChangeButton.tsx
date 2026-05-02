import { InfoIcon } from '@phosphor-icons/react';
import { Offering, Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ToolbarButton } from '@/table/ToolbarButton';

interface ResourceViewChangeButtonProps {
  resource: Resource;
  offering: Offering;
  refetch(): void;
}

const ResourceViewChangeDialog = lazyComponent(() =>
  import('./ResourceViewChangeDialog').then((module) => ({
    default: module.ResourceViewChangeDialog,
  })),
);

export const ResourceViewChangeButton = ({
  resource,
  offering,
  refetch,
}: ResourceViewChangeButtonProps) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(ResourceViewChangeDialog, {
      resolve: { resource, offering, refetch },
      size: 'lg',
    });

  return (
    <ToolbarButton
      title={translate('View change')}
      iconNode={<InfoIcon weight="bold" />}
      onClick={callback}
      variant="tertiary"
      size="sm"
    />
  );
};
