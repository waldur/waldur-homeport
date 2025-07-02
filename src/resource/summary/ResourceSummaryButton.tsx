import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ActionItem } from '../actions/ActionItem';
import { ActionItemType } from '../actions/types';

const ResourceSummaryModal = lazyComponent(() =>
  import('./ResourceSummaryModal').then((module) => ({
    default: module.ResourceSummaryModal,
  })),
);

export const ResourceSummaryAction: ActionItemType = ({ resource }) => {
  const dispatch = useDispatch();
  const showDetailsModal = () => {
    dispatch(
      openModalDialog(ResourceSummaryModal, {
        resolve: { url: resource.url },
      }),
    );
  };
  return (
    <ActionItem
      title={translate('Details')}
      action={showDetailsModal}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
