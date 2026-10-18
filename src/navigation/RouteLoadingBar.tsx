import { useEffect, useState } from 'react';

import { queryClient } from '@/core/queryClient';
import { translate } from '@/i18n';
import {
  getPendingChunks,
  onPendingChunksChange,
} from '@/navigation/pageLoading';
import { router } from '@/router';

import './RouteLoadingBar.scss';

const SHOW_DELAY = 100; // no flicker on instant transitions
const MIN_VISIBLE = 300; // no flash once shown
const SETTLE_DELAY = 50; // gap between a page's code arriving and its queries starting

export const RouteLoadingBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Most pages open at once and then fetch their data, so the bar runs from
    // the transition until the new page's code and queries have loaded.
    let navigating = 0;
    let settling = false;
    let startedAt = 0;
    let shownAt = 0;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout>;
    let settleTimer: ReturnType<typeof setTimeout>;

    const isBusy = () =>
      navigating > 0 || getPendingChunks() > 0 || queryClient.isFetching() > 0;

    // Shown only if something is still loading once SHOW_DELAY has passed:
    // the settle gap alone must not make a fast page flash the bar.
    const showIfBusy = () => {
      showTimer = undefined;
      if (isBusy()) {
        shownAt = Date.now();
        setVisible(true);
      }
    };

    const update = () => {
      const busy = isBusy();
      clearTimeout(settleTimer);
      if (settling && !busy) {
        settleTimer = setTimeout(() => {
          settling = false;
          update();
        }, SETTLE_DELAY);
      }
      if (navigating || settling) {
        clearTimeout(hideTimer);
        startedAt ||= Date.now();
        if (busy && !shownAt && !showTimer) {
          showTimer = setTimeout(
            showIfBusy,
            SHOW_DELAY - (Date.now() - startedAt),
          );
        }
      } else {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        showTimer = undefined;
        startedAt = 0;
        if (shownAt) {
          hideTimer = setTimeout(
            () => {
              shownAt = 0;
              setVisible(false);
            },
            MIN_VISIBLE - (Date.now() - shownAt),
          );
        }
      }
    };

    const unsubscribe = queryClient.getQueryCache().subscribe(update);
    const unsubscribeChunks = onPendingChunksChange(update);
    // High priority so the wait for resolvers, also in an onBefore hook, is covered.
    const deregister = router.transitionService.onBefore(
      {},
      (transition) => {
        navigating += 1;
        update();
        const done = (opened: boolean) => () => {
          navigating -= 1;
          settling ||= opened;
          update();
        };
        transition.promise.then(done(true), done(false));
      },
      { priority: 1000 },
    );
    return () => {
      deregister();
      unsubscribe();
      unsubscribeChunks();
      [showTimer, hideTimer, settleTimer].forEach(clearTimeout);
    };
  }, []);

  return visible ? (
    <div
      className="route-loading-bar"
      role="progressbar"
      aria-label={translate('Loading')}
    />
  ) : null;
};
