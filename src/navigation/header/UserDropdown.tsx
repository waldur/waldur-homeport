import { forwardRef, FunctionComponent } from 'react';

import { Badge, Menu } from 'waldur-ui';

import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { NavMenuLink } from '@/navigation/NavMenu';
import { useUser } from '@/workspace/hooks';

import { ThemeSwitcher } from '../../theme/ThemeSwitcher';

import { LanguageSelectorDropdown } from './LanguageSelectorDropdown';
import { LogoutMenuItem } from './LogoutMenuItem';
import { UserDropdownMenuItems } from './UserDropdownMenuItems';
import { UserIpAddress } from './UserIpAddress';
import { UserToken } from './UserToken';
import { WebShellMenuItem } from './WebShellMenuItem';

/**
 * forwardRef so this composes under Menu.Trigger's `asChild` — see
 * ActionsDropdown.tsx's TableDropdownToggle for the general requirement.
 */
const UserMenuToggle = forwardRef<HTMLButtonElement>((props, ref) => {
  const user = useUser();
  return (
    // Not a BaseButton: the trigger's content is an avatar image plus a
    // two-line name/role block (and a conditional Staff badge), none of
    // which fits BaseButton's single iconNode + label slots. The original
    // className carried bare `btn` purely for Bootstrap's button reset
    // (no variant class), so that reset is reproduced directly here instead.
    <button
      ref={ref}
      type="button"
      className="cursor-pointer border-0 bg-transparent d-flex align-items-center gap-4 py-2 px-2"
      aria-label={translate('User menu')}
      {...props}
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
            shape="pill"
            tone="outline"
            className="align-items-end mt-1"
          >
            {translate('Staff')}
          </Badge>
        )}
      </div>
    </button>
  );
});
UserMenuToggle.displayName = 'UserMenuToggle';

/** The user menu's header: the avatar, the name and the email. */
const UserMenuHeader = ({ user }: { user: ReturnType<typeof useUser> }) => (
  <>
    <div className="symbol symbol-50px me-5">
      {!user ? (
        <ImagePlaceholder width="40px" height="40px" circle />
      ) : (
        <Avatar src={user.image} name={user.full_name} size={40} circle />
      )}
    </div>
    <div className="d-flex flex-column">
      <div className="fw-bolder d-flex align-items-center fs-5">
        {user ? user.full_name : translate('Guest')}
      </div>
      {user ? (
        // The classes the email had as a Link (Link's text-anchor, which
        // replaced text-muted): the brand link colour.
        <span className="fw-bold text-hover-primary fs-7 text-anchor">
          {user.email}
        </span>
      ) : (
        <span className="fw-bold text-muted fs-7">
          {translate('Not signed in')}
        </span>
      )}
    </div>
  </>
);

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useUser();
  return (
    <Menu modal={false}>
      <Menu.Trigger asChild>
        <UserMenuToggle />
      </Menu.Trigger>
      <Menu.Content align="end" className="fw-bold py-4 fs-6 w-275px">
        {/* The header: a row that links to the profile, so the keyboard
            reaches it like any other row. */}
        {user ? (
          <Menu.Item asChild className="px-[16.25px] py-[8px]">
            <Link state="profile.details">
              <UserMenuHeader user={user} />
            </Link>
          </Menu.Item>
        ) : (
          <div className="flex items-center px-[16.25px] py-[8px]">
            <UserMenuHeader user={user} />
          </div>
        )}

        {user ? (
          <UserDropdownMenuItems />
        ) : (
          <NavMenuLink state="login" label={translate('Sign in')} />
        )}

        <Menu.Separator />

        <LanguageSelectorDropdown />

        <WebShellMenuItem />

        {user && <LogoutMenuItem />}

        {!ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME && (
          <>
            <Menu.Separator />
            <ThemeSwitcher />
          </>
        )}

        {user && (
          <>
            <Menu.Separator />
            {(!isFeatureVisible(UserFeatures.conceal_api_token) ||
              user.is_staff ||
              user.is_support) && <UserToken token={user.token} />}
            <UserIpAddress ip={user.ip_address} />
          </>
        )}
      </Menu.Content>
    </Menu>
  );
};
