import { CaretLeftIcon, ListIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { useSidebar, BaseButton, Tooltip } from 'waldur-ui';

import { isAssistantEnabled } from '@/ai-assistant/utils';
import { DEFAULT_REDIRECT_STATE, isSignInStep } from '@/auth/authNavigation';
import { getIconUrl } from '@/core/api';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport as hasSupportSelector } from '@/issues/hooks';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { router } from '@/router';
import { useUser } from '@/workspace/hooks';

import { BreadcrumbMain } from './breadcrumb/BreadcrumbMain';
import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';
import { LLMChatDrawerToggle } from './LLMChatDrawerToggle';
import { QuickIssueDrawerToggle } from './QuickIssueDrawerToggle';
import { SearchToggle } from './search/SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const AsideMobileToggle: FunctionComponent = () => {
  const { openMobile, toggleSidebar } = useSidebar();
  return (
    <Tooltip label={translate('Toggle navigation menu')} side="bottom">
      <button
        id="kt_aside_mobile_toggle"
        type="button"
        aria-label={translate('Toggle navigation menu')}
        aria-expanded={openMobile}
        onClick={toggleSidebar}
        className="btn-nav-item me-1"
      >
        <span className="svg-icon svg-icon-1x">
          <ListIcon weight="bold" />
        </span>
      </button>
    </Tooltip>
  );
};

interface AppHeaderProps {
  hasBreadcrumbs?: boolean;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  hasBreadcrumbs,
}) => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();
  const imageUrl = getIconUrl('sidebar_logo_mobile');
  const [errorImg, setErrorImg] = useState(false);

  // The chat-bubble drawer now hosts both Helpdesk and Team chat, so it must
  // appear when either is available — not just when support is enabled.
  const showSupportDrawer = hasSupportSelector() || isMatrixChatEnabled();

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.lg });
  const showGoBack = Boolean(state.data?.showGoBack);

  const onGoBack = () => {
    // A page opened from an email link, or reached through a login redirect
    // (the form, an SSO callback, or a profile gate on first sign-in), has
    // no page in the app to go back to. A reload looks the same, so it also
    // lands on the dashboard.
    const previous = router.globals.successfulTransitions
      .peekTail()
      ?.from().name;
    if (previous && !isSignInStep(previous)) {
      window.history.back();
    } else {
      router.stateService.go(DEFAULT_REDIRECT_STATE);
    }
  };

  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          {Boolean(user) && <AsideMobileToggle />}

          {!errorImg && (
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <Link
                state={user ? 'profile.details' : null}
                className="d-lg-none text-dark"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Logo"
                    onError={() => setErrorImg(true)}
                    className="h-30px"
                  />
                ) : null}
              </Link>
            </div>
          )}
        </div>
        <div
          className="d-flex align-items-stretch justify-content-between flex-grow-1"
          style={{ minWidth: 0 }}
        >
          <div
            className="d-flex align-items-stretch justify-content-between flex-grow-1 flex-shrink-1"
            // flex-basis: 0 makes this breadcrumb area's width the grown share
            // of free space — independent of its (long) content width — and
            // overflow: hidden clips the trail. Together these guarantee it can
            // never push the header actions (search / confirmation / user menu)
            // off screen, and they give the breadcrumb <ol> a real width so its
            // overflow measurement (Breadcrumbs.tsx) can collapse the middle.
            style={{ minWidth: 0, flexBasis: 0, overflow: 'hidden' }}
          >
            {Boolean(user) && showGoBack && (
              <BaseButton
                variant="text-primary"
                className="me-3 py-0 align-self-center fw-semibold fs-5"
                onClick={onGoBack}
                tooltip={translate('Go back')}
                style={{ width: '108px', height: '36px' }}
                iconNode={<CaretLeftIcon size={18} weight="bold" />}
                label={translate('Go back')}
              />
            )}
            {hasBreadcrumbs && <BreadcrumbMain />}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0 ms-3">
            {Boolean(user) && (
              <SearchToggle compact={Boolean(hasBreadcrumbs || isSmallScr)} />
            )}
            {Boolean(user) && showSupportDrawer && <QuickIssueDrawerToggle />}
            {Boolean(user) && <ConfirmationDrawerToggle />}
            {isAssistantEnabled(user) && <LLMChatDrawerToggle />}
            {Boolean(user) && isSmallScr && (
              <span className="h-40px border-end align-self-center ms-1" />
            )}
            <div className="d-flex align-items-center ms-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
