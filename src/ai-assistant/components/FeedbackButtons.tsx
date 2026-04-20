import { ThumbsDownIcon, ThumbsUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { FeedbackDialog } from './FeedbackDialog';

interface Props {
  messageUuid: string;
  feedbackScore: boolean | null;
  feedbackComment: string | null;
  feedbackCategory: FeedbackCategoryEnum | null;
}

export const FeedbackButtons: FC<Props> = ({
  messageUuid,
  feedbackScore,
  feedbackComment,
  feedbackCategory,
}) => {
  const dispatch = useDispatch();

  const openDialog = (score: boolean) => {
    // When the user flips their vote, drop the prior comment/category —
    // they don't belong on a newly-opposite score.
    const keepPriorDetails = score === feedbackScore;
    dispatch(
      openModalDialog(FeedbackDialog, {
        resolve: {
          messageUuid,
          score,
          currentComment: keepPriorDetails ? feedbackComment : null,
          currentCategory: keepPriorDetails ? feedbackCategory : null,
        },
        size: 'md',
      }),
    );
  };

  const upActive = feedbackScore === true;
  const downActive = feedbackScore === false;

  return (
    <>
      <button
        type="button"
        className={classNames('aui-message-action-btn', 'is-positive')}
        aria-label={
          upActive
            ? translate('Helpful (selected). Activate to edit your feedback.')
            : translate('Helpful')
        }
        aria-pressed={upActive}
        onClick={() => openDialog(true)}
      >
        <ThumbsUpIcon weight={upActive ? 'fill' : 'regular'} size={16} />
      </button>
      <button
        type="button"
        className={classNames('aui-message-action-btn', 'is-negative')}
        aria-label={
          downActive
            ? translate(
                'Not helpful (selected). Activate to edit your feedback.',
              )
            : translate('Not helpful')
        }
        aria-pressed={downActive}
        onClick={() => openDialog(false)}
      >
        <ThumbsDownIcon weight={downActive ? 'fill' : 'regular'} size={16} />
      </button>
    </>
  );
};
