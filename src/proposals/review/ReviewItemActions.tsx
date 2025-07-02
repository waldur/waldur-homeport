import {
  ArrowBendDoubleUpLeftIcon,
  FileMagnifyingGlassIcon,
} from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ProposalReview } from '@waldur/proposals/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { useReviewActions } from './utils';

interface ReviewItemActionProps {
  row: ProposalReview;
  refetch;
}

export const ReviewItemAction = ({ row, refetch }: ReviewItemActionProps) => {
  const { accept, reject, isAccepting, isRejecting } = useReviewActions(
    row,
    refetch,
  );

  return row.state === 'created' ? (
    <>
      <ActionItem
        title={translate('Start review')}
        action={accept}
        iconNode={<FileMagnifyingGlassIcon weight="bold" />}
        disabled={isAccepting || isRejecting}
      />

      <ActionItem
        title={translate('Send back')}
        action={reject}
        iconNode={<ArrowBendDoubleUpLeftIcon weight="bold" />}
        disabled={isAccepting || isRejecting}
      />
    </>
  ) : null;
};
