import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ActionItem } from '../actions/ActionItem';
import { ActionItemType } from '../actions/types';

const ResourceSummaryModal = lazyComponent(() =>
  import('./ResourceSummaryModal').then((module) => ({
    default: module.ResourceSummaryModal,
  })),
);

export const ResourceSummaryAction: ActionItemType = ({ resource }) => {
  const { openDialog } = useModal();
  const showDetailsModal = () => {
    openDialog(ResourceSummaryModal, {
      resolve: { url: resource.url },
    });
  };
  return (
    <ActionItem
      title={translate('Details')}
      action={showDetailsModal}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
