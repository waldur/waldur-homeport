import { FunctionComponent } from 'react';

import Avatar from '@waldur/core/Avatar';
import { ENV } from '@waldur/core/config';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

import { ThemeSwitcher } from '../../theme/ThemeSwitcher';

import { LanguageSelectorDropdown } from './LanguageSelectorDropdown';
import { UserDropdownMenuItems } from './UserDropdownMenuItems';
import { UserToken } from './UserToken';

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useUser();
  return (
    <>
      <div
        className="btn btn-active-light d-flex align-items-center gap-2 bg-hover-light py-2 px-2 px-md-3"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom"
        data-kt-menu-flip="bottom"
        data-cy="user-dropdown-trigger"
      >
        <div className="cursor-pointer symbol symbol-30px symbol-md-40px justify-content-center">
          {!user ? (
            <ImagePlaceholder width="40px" height="40px" circle />
          ) : (
            <Avatar src={user.image} name={user.full_name} size={40} circle />
          )}
        </div>
        <div className="d-none d-md-flex flex-column align-items-center justify-content-center me-2 mt-2">
          {!user?.is_staff && (
            <span className="text-muted fs-7 fw-semibold lh-1 mb-2">
              {translate('Hello')}
            </span>
          )}
          <span className="text-dark fs-base fw-bold lh-1">
            {user ? user.first_name : translate('Guest')}
          </span>
          {user?.is_staff && (
            <span className="badge badge-light-info fs-8 lh-1 mt-1 align-items-end">
              {translate('Staff')}
            </span>
          )}
        </div>
      </div>
      <div
        className="menu-dropdown-default menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-gray fw-bold py-4 fs-6 w-275px"
        data-kt-menu="true"
        data-popper-placement="bottom-end"
        data-cy="user-dropdown-menu"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-2">
            <div className="symbol symbol-50px me-5">
              {!user ? (
                <ImagePlaceholder width="40px" height="40px" circle />
              ) : (
                <Avatar
                  src={user.image}
                  name={user.full_name}
                  size={40}
                  circle
                />
              )}
            </div>

            <div className="d-flex flex-column">
              <div className="fw-bolder d-flex align-items-center fs-5">
                {user ? user.full_name : translate('Guest')}
              </div>
              {user ? (
                <Link
                  state="profile.details"
                  className="fw-bold text-muted text-hover-primary fs-7"
                >
                  {user.email}
                </Link>
              ) : (
                <span className="fw-bold text-muted fs-7">
                  {translate('Not signed in')}
                </span>
              )}
            </div>
          </div>
        </div>

        {user ? (
          <UserDropdownMenuItems />
        ) : (
          <div className="d-grid gap-2 px-5">
            <Link
              state="login"
              className="btn btn-light btn-color-dark btn-active-color-dark"
            >
              {translate('Sign in')}
            </Link>
          </div>
        )}

        <div className="separator my-2" />

        <LanguageSelectorDropdown />

        {user && (
          <div className="menu-item" data-kt-menu-trigger="click">
            <Link
              state="logout"
              className="menu-link"
              aria-hidden="true"
              label={translate('Log out')}
            />
          </div>
        )}

        {!ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME && (
          <>
            <div className="separator my-2" />
            <ThemeSwitcher />
          </>
        )}

        {user && (
          <>
            <div className="separator my-2" />
            <UserToken token={user.token} />
          </>
        )}
      </div>
    </>
  );
};
