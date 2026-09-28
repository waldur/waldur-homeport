import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      variant="tertiary"
      onClick={() =>
        openDialog(ResourceMetadataDialog, {
          resolve: props,
          size: 'lg',
        })
      }
      label={translate('Show')}
      size="sm"
    />
  );
};
