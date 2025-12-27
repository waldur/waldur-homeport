import { ListIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { getIconUrl } from '@waldur/core/api';
import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { Link } from '@waldur/core/Link';
import { hasSupport as hasSupportSelector } from '@waldur/issues/hooks';
import { useUser } from '@waldur/workspace/hooks';

import { getTitle } from '../title';

import { BreadcrumbMain } from './breadcrumb/BreadcrumbMain';
import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';
import { LLMChatDrawerToggle } from './LLMChatDrawerToggle';
import { QuickIssueDrawerToggle } from './QuickIssueDrawerToggle';
import { SearchToggle } from './search/SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const AsideMobileToggle: FunctionComponent = () => (
  <button
    className="btn-nav-item me-1"
    id="kt_aside_mobile_toggle"
    type="button"
  >
    <span className="svg-icon svg-icon-1x">
      <ListIcon weight="bold" />
    </span>
  </button>
);

interface AppHeaderProps {
  hasBreadcrumbs?: boolean;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  hasBreadcrumbs,
}) => {
  const pageTitle = useSelector(getTitle);
  const user = useUser();
  const imageUrl = getIconUrl('sidebar_logo_mobile');
  const [errorImg, setErrorImg] = useState(false);

  const hasSupport = useSelector(hasSupportSelector);

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.lg });

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
        <div className="d-flex align-items-stretch justify-content-between flex-grow-1">
          <div className="d-flex align-items-stretch justify-content-between flex-grow-1 flex-shrink-1">
            {hasBreadcrumbs ? (
              <BreadcrumbMain />
            ) : pageTitle ? (
              <div className="page-title d-flex align-items-center me-3">
                <h1 className="text-dark fw-boldest fs-2 my-1">{pageTitle}</h1>
              </div>
            ) : (
              !isSmallScr && <SearchToggle />
            )}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            {Boolean(user) && (hasBreadcrumbs || pageTitle || isSmallScr) && (
              <SearchToggle compact={hasBreadcrumbs} />
            )}
            {Boolean(user) && hasSupport && <QuickIssueDrawerToggle />}
            {Boolean(user) && <ConfirmationDrawerToggle />}
            {Boolean(user) && <LLMChatDrawerToggle />}
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
