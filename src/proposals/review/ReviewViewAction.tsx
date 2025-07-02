import { EyeIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';

export const ReviewViewAction = ({ row }) => {
  const { state } = useCurrentStateAndParams();

  const callback = () => {
    router.stateService.go(
      state.parent === 'reviews' ? 'proposal-review-view' : 'proposal-review',
      { review_uuid: row.uuid },
    );
  };

  if (
    state.name !== 'call-management.review-list' &&
    row.state !== 'in_review'
  ) {
    return null;
  }

  const title =
    state.name === 'call-management.review-list'
      ? translate('View')
      : translate('Continue review');

  const icon =
    state.name === 'call-management.review-list' ? (
      <EyeIcon weight="bold" />
    ) : (
      <PencilSimpleIcon weight="bold" />
    );

  return <ActionItem title={title} action={callback} iconNode={icon} />;
};
