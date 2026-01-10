import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

import { Resource } from '../types';

import { ResourceSummaryProps } from './types';

const ResourceMetadataDialog = lazyComponent(() =>
  import('./ResourceMetadataDialog').then((module) => ({
    default: module.ResourceMetadataDialog,
  })),
);

export const ResourceMetadataLink = <T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      variant="link"
      className="btn-flush"
      action={() =>
        openDialog(ResourceMetadataDialog, {
          resolve: props,
          size: 'lg',
        })
      }
      title={translate('Show')}
    />
  );
};
