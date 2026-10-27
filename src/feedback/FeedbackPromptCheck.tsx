import { FC, useEffect, useState } from 'react';
import { FeedbackPrompt, feedbackSurveysPrompt } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { useProfileCompletenessContext } from '@/user/ProfileCompletenessContext';
import { useUser } from '@/workspace/hooks';

const FeedbackPromptDialog = lazyComponent(() =>
  import('./FeedbackPromptDialog').then((module) => ({
    default: module.FeedbackPromptDialog,
  })),
);

// Asked at most once per user per tab session; the backend also snoozes a
// shown prompt, so other tabs don't show it again.
const sessionKey = (userUuid: string) => `feedbackPromptChecked:${userUuid}`;

const wasChecked = (key: string) => {
  try {
    return Boolean(sessionStorage.getItem(key));
  } catch {
    return false;
  }
};

const markChecked = (key: string) => {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Storage may be unavailable; the backend snooze still applies.
  }
};

export const FeedbackPromptCheck: FC = () => {
  const { openDialog, modalComponent } = useModal();
  const user = useUser();
  const [prompt, setPrompt] = useState<FeedbackPrompt>();
  // Not over the profile and terms form that blocks navigation.
  const profileIncomplete =
    useProfileCompletenessContext().shouldBlockNavigation;

  useEffect(() => {
    // The backend leaves out staff, support and users outside the audience.
    if (!user || profileIncomplete) return;
    const key = sessionKey(user.uuid);
    if (wasChecked(key)) return;
    const controller = new AbortController();
    feedbackSurveysPrompt({ signal: controller.signal })
      .then((response) => {
        markChecked(key);
        // 204 No Content means there is nothing to ask.
        const data = response.data as FeedbackPrompt | undefined;
        if (data?.request_uuid) setPrompt(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [user?.uuid, profileIncomplete]);

  // Never replace a dialog the user already has open.
  useEffect(() => {
    if (prompt && !modalComponent) {
      setPrompt(undefined);
      openDialog(FeedbackPromptDialog, {
        resolve: { prompt },
        size: 'lg',
        // Only × and the footer buttons close it, so each close is recorded.
        backdrop: 'static',
        keyboard: false,
      });
    }
  }, [prompt, modalComponent]);

  return null;
};
