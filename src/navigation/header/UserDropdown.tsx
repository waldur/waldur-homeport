import { FunctionComponent } from 'react';

import Avatar from '@/core/Avatar';
import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { ThemeSwitcher } from '../../theme/ThemeSwitcher';

import { LanguageSelectorDropdown } from './LanguageSelectorDropdown';
import { UserDropdownMenuItems } from './UserDropdownMenuItems';
import { UserIpAddress } from './UserIpAddress';
import { UserToken } from './UserToken';

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useUser();
  return (
    <>
      <button
        type="button"
        className="btn d-flex align-items-center gap-4 py-2 px-2"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom"
        data-kt-menu-flip="bottom"
        aria-label={translate('User menu')}
      >
        <div className="cursor-pointer symbol symbol-30px symbol-md-40px justify-content-center">
          {!user ? (
            <ImagePlaceholder width="40px" height="40px" circle />
          ) : (
            <Avatar src={user.image} name={user.full_name} size={40} circle />
          )}
        </div>
        <div className="d-none d-md-flex flex-column align-items-start justify-content-center">
          {!user?.is_staff && (
            <span className="text-muted fs-7 fw-semibold lh-1 mb-2">
              {translate('Hello')}
            </span>
          )}
          <span className="text-dark fs-base fw-bold lh-1">
            {user ? user.first_name : translate('Guest')}
          </span>
          {user?.is_staff && (
            <Badge
              variant="purple"
              size="sm"
              pill
              outline
              className="align-items-end mt-1"
            >
              {translate('Staff')}
            </Badge>
          )}
        </div>
      </button>
      <div
        className="menu-dropdown-default menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-gray fw-bold py-4 fs-6 w-275px"
        data-kt-menu="true"
        data-popper-placement="bottom-end"
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
            {(!isFeatureVisible(UserFeatures.conceal_api_token) ||
              user.is_staff ||
              user.is_support) && <UserToken token={user.token} />}
            <UserIpAddress ip={user.ip_address} />
          </>
        )}
      </div>
    </>
  );
};
