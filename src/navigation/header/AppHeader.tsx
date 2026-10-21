import { CaretLeftIcon, ListIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
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
      // Layout places it: sticky at the top of the page, beside the sidebar.
      className="print:hidden"
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
