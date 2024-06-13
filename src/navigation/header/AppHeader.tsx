import { List } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { fixURL } from '@waldur/core/api';
import DefaultLogo from '@waldur/images/logo.svg';
import { hasSupport as hasSupportSelector } from '@waldur/issues/hooks';
import { getUser } from '@waldur/workspace/selectors';

import { getTitle } from '../title';

import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';
import { FavoritePagesDropdown } from './FavoritePagesDropdown';
import { QuickIssueDrawerToggle } from './QuickIssueDrawerToggle';
import { SearchToggle } from './search/SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const AsideMobileToggle: FunctionComponent = () => (
  <div
    className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
    id="kt_aside_mobile_toggle"
  >
    <span className="svg-icon svg-icon-1">
      <List />
    </span>
  </div>
);

interface AppHeaderProps {
  breadcrumbs?;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  breadcrumbs,
}) => {
  const pageTitle = useSelector(getTitle);
  const user = useSelector(getUser);
  const imageUrl = fixURL('/icons/sidebar_logo_mobile/');

  const hasSupport = useSelector(hasSupportSelector);

  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          <AsideMobileToggle />

          <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
            <div className="d-lg-none">
              {imageUrl ? (
                <img src={imageUrl} alt="Logo" className="h-30px" />
              ) : (
                <DefaultLogo className="h-30px" />
              )}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
          <div className="d-flex align-items-stretch justify-content-between flex-grow-1 flex-shrink-1">
            {breadcrumbs ? (
              <div className="d-flex align-items-center">{breadcrumbs}</div>
            ) : pageTitle ? (
              <div className="page-title d-flex align-items-center me-3">
                <h1 className="text-dark fw-boldest fs-2 my-1">{pageTitle}</h1>
              </div>
            ) : (
              <SearchToggle />
            )}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            {user && (breadcrumbs || pageTitle) && <SearchToggle />}
            {user && <FavoritePagesDropdown />}
            {user && hasSupport && <QuickIssueDrawerToggle />}
            {user && <ConfirmationDrawerToggle />}
            <div className="d-flex align-items-center ms-1 ms-lg-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
