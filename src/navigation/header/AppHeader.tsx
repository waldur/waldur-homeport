import { CaretLeftIcon, ListIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import {
  useSidebar,
  BaseButton,
  IconButton,
  TopBar,
  useBreakpointDown,
} from 'waldur-ui';

import { isAssistantEnabled } from '@/ai-assistant/utils';
import { DEFAULT_REDIRECT_STATE, isSignInStep } from '@/auth/authNavigation';
import { getIconUrl } from '@/core/api';
import { Link } from '@/core/Link';
import { useIsDrawerOpenWith } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
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
    <IconButton
      id="kt_aside_mobile_toggle"
      label={translate('Toggle navigation menu')}
      aria-expanded={openMobile}
      onClick={toggleSidebar}
      icon={<ListIcon weight="bold" />}
      iconSize="lg"
      className="me-[0.25rem]"
    />
  );
};

interface AppHeaderProps {
  hasBreadcrumbs?: boolean;
  /** The impersonation bar is showing above the header. */
  hasPageBar?: boolean;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  hasBreadcrumbs,
  hasPageBar,
}) => {
  const { state: sidebarState } = useSidebar();
  const floatingDrawerOpen = [
    useIsDrawerOpenWith(DRAWER_SHELL_CLASS.ai),
    useIsDrawerOpenWith(DRAWER_SHELL_CLASS.support),
    useIsDrawerOpenWith(DRAWER_SHELL_CLASS.confirmation),
  ].some(Boolean);
  const { state } = useCurrentStateAndParams();
  const user = useUser();
  const imageUrl = getIconUrl('sidebar_logo_mobile');
  const [errorImg, setErrorImg] = useState(false);

  // The chat-bubble drawer now hosts both Helpdesk and Team chat, so it must
  // appear when either is available — not just when support is enabled.
  const showSupportDrawer = hasSupportSelector() || isMatrixChatEnabled();

  const isSmallScr = useBreakpointDown('lg');
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
    <TopBar
      data-app-header
      className={classNames(
        // Fixed to the top of the viewport (under the impersonation bar while
        // it shows) and, from lg, beside the sidebar, following it as it
        // collapses. Without a user there is no sidebar.
        'fixed inset-x-0 top-0 print:hidden',
        hasPageBar && 'top-[var(--kt-pagebar-height)]',
        Boolean(user) &&
          (sidebarState === 'collapsed'
            ? 'lg:left-[var(--sidebar-width-icon)]'
            : 'lg:left-[var(--sidebar-width)]'),
        'lg:transition-[left] lg:duration-300 lg:ease-[ease]',
        // A floating drawer (z 110, --z-index-mobile-drawer) sits over the
        // page under the header; lift the header one above it while one is
        // open, so the header's menus, which open down into the drawer's
        // band, are not painted behind it.
        floatingDrawerOpen ? 'z-[111]' : 'z-header',
      )}
      left={
        <div className="flex items-center lg:hidden -ms-[0.5rem] me-[0.5rem]">
          {Boolean(user) && <AsideMobileToggle />}

          {!errorImg && (
            <div className="flex items-center grow lg:grow-0">
              <Link
                state={user ? 'profile.details' : null}
                className="lg:hidden text-primary"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Logo"
                    onError={() => setErrorImg(true)}
                    className="h-[30px]"
                  />
                ) : null}
              </Link>
            </div>
          )}
        </div>
      }
      center={
        <>
          {Boolean(user) && showGoBack && (
            <BaseButton
              variant="text-primary"
              className="me-[0.75rem] py-[0px] self-center text-base"
              onClick={onGoBack}
              tooltip={translate('Go back')}
              style={{ width: '108px', height: '36px' }}
              iconNode={<CaretLeftIcon size={18} weight="bold" />}
              label={translate('Go back')}
            />
          )}
          {hasBreadcrumbs && <BreadcrumbMain />}
        </>
      }
      right={
        <>
          {Boolean(user) && (
            <SearchToggle compact={Boolean(hasBreadcrumbs || isSmallScr)} />
          )}
          {Boolean(user) && showSupportDrawer && <QuickIssueDrawerToggle />}
          {Boolean(user) && <ConfirmationDrawerToggle />}
          {isAssistantEnabled(user) && <LLMChatDrawerToggle />}
          {Boolean(user) && isSmallScr && (
            <span className="h-[40px] border-r-[1px] border-r-secondary self-center ms-[0.25rem]" />
          )}
          <div className="flex items-center ms-[0.75rem]">
            <UserDropdownMenu />
          </div>
        </>
      }
    />
  );
};
