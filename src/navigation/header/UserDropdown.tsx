import { forwardRef, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

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
import { isStaffOrSupportOrImpersonating } from '@/workspace/selectors';

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
      className="cursor-pointer border-0 bg-transparent flex items-center gap-4 py-2 px-2"
      aria-label={translate('User menu')}
      {...props}
    >
      <div className="cursor-pointer symbol symbol-30px symbol-md-40px justify-center">
        {!user ? (
          <ImagePlaceholder width="40px" height="40px" circle />
        ) : (
          <Avatar src={user.image} name={user.full_name} size={40} circle />
        )}
      </div>
      <div className="hidden md:flex flex-col items-start justify-center">
        {!user?.is_staff && (
          <span className="text-quaternary text-xs leading-none mb-2">
            {translate('Hello')}
          </span>
        )}
        <span className="text-primary text-base font-medium leading-none">
          {user ? user.first_name : translate('Guest')}
        </span>
        {user?.is_staff && (
          <Badge
            variant="purple"
            size="sm"
            shape="pill"
            tone="outline"
            className="items-end mt-1"
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
    <div className="flex flex-col">
      <div className="font-semibold flex items-center text-base">
        {user ? user.full_name : translate('Guest')}
      </div>
      {user ? (
        // The classes the email had as a Link (Link's text-anchor, which
        // replaced text-muted): the brand link colour.
        <span className="font-medium hover:text-brand text-xs text-anchor">
          {user.email}
        </span>
      ) : (
        <span className="font-medium text-quaternary text-xs">
          {translate('Not signed in')}
        </span>
      )}
    </div>
  </>
);

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useUser();
  const canSeeToken = useSelector(isStaffOrSupportOrImpersonating);
  return (
    <Menu modal={false}>
      <Menu.Trigger asChild>
        <UserMenuToggle />
      </Menu.Trigger>
      <Menu.Content align="end" className="font-medium py-4 text-sm w-275px">
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
              canSeeToken) && <UserToken token={user.token} />}
            <UserIpAddress ip={user.ip_address} />
          </>
        )}
      </Menu.Content>
    </Menu>
  );
};
