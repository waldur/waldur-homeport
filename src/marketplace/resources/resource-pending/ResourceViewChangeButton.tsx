import { InfoIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { Offering, Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ToolbarButton } from '@waldur/table/ToolbarButton';

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
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ResourceViewChangeDialog, {
        resolve: { resource, offering, refetch },
        size: 'lg',
      }),
    );

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
