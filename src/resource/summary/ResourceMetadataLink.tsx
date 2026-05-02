import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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
