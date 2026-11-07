import { EyeIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { router } from '@/router';

export const ReviewViewAction = ({ row }) => {
  const { state } = useCurrentStateAndParams();

  const callback = () => {
    router.stateService.go(
      state.parent === 'reviews' ? 'proposal-review-view' : 'proposal-review',
      { review_uuid: row.uuid },
    );
  };

  const managing = state.name === 'call-management.review-list';
  // The reviewer's own list, where a finished review stays readable.
  const ownList = state.parent === 'reviews';
  const continuing = !managing && row.state === 'in_review';
  if (!managing && !ownList && !continuing) {
    return null;
  }

  const title = managing
    ? translate('View')
    : continuing
      ? translate('Continue review')
      : translate('View review');

  const icon = continuing ? (
    <PencilSimpleIcon weight="bold" />
  ) : (
    <EyeIcon weight="bold" />
  );

  return <ActionItem title={title} action={callback} iconNode={icon} />;
};
