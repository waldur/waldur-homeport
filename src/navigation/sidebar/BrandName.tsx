import { SquaresFourIcon, ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  FunctionComponent,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Dropdown } from 'react-bootstrap';
import { externalLinksList } from 'waldur-js-client';

import { SHORTCUTS_QUERY_KEY } from '@waldur/administration/quick-shortcuts/utils';
import { getIconUrl } from '@waldur/core/api';
import Avatar from '@waldur/core/Avatar';
import { ENV } from '@waldur/core/config';
import { Link } from '@waldur/core/Link';
import { SidebarToggleGraphic } from '@waldur/core/SidebarToggleGraphic';
import { translate } from '@waldur/i18n';
import { useLayout } from '@waldur/metronic/layout/core';
import { useTheme } from '@waldur/theme/useTheme';

interface BrandNameProps {
  isAsideHovered?: boolean;
}

export const BrandName: FunctionComponent<BrandNameProps> = ({
  isAsideHovered = false,
}) => {
  const { theme } = useTheme();
  const configuredStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';
  const sidebarTheme =
    configuredStyle === 'auto'
      ? theme === 'dark'
        ? 'dark'
        : 'light'
      : configuredStyle;
  const layout = useLayout();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userHasToggled, setUserHasToggled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-minimize sidebar for medium screens (768px - 1399px)
  useEffect(() => {
    // Only auto-resize if user hasn't manually toggled
    if (userHasToggled) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const shouldMinimize = width >= 768 && width < 1400;

      if (shouldMinimize && !layout.config.aside.minimized) {
        layout.setLayout({
          aside: {
            ...layout.config.aside,
            minimized: true,
          },
        });
      } else if (
        !shouldMinimize &&
        width >= 1400 &&
        layout.config.aside.minimized
      ) {
        layout.setLayout({
          aside: {
            ...layout.config.aside,
            minimized: false,
          },
        });
      }
    };

    // Check on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, userHasToggled]);

  const { data: shortcutsResponse } = useQuery({
    queryKey: SHORTCUTS_QUERY_KEY,
    queryFn: () =>
      externalLinksList({ query: { page_size: 50 } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });

  const shortcuts = shortcutsResponse || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // switch aside.minimized to keep sidebar state between pages
  const toggleSidebar = useCallback(() => {
    setUserHasToggled(true);
    layout.setLayout({
      aside: {
        ...layout.config.aside,
        minimized: !layout.config.aside.minimized,
      },
    });
  }, [layout]);

  const sidebarLogoUrl = getIconUrl('sidebar_logo');
  const sidebarLogoMobileUrl = getIconUrl('sidebar_logo_mobile');
  const sidebarLogoDarkUrl = getIconUrl('sidebar_logo_dark');
  const sidebarLogo =
    (sidebarTheme === 'accent' || sidebarTheme === 'dark') &&
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_DARK
      ? sidebarLogoDarkUrl
      : ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO
        ? sidebarLogoUrl
        : undefined;

  const DropdownMenu = (
    <Dropdown.Menu
      show={showDropdown}
      className="p-0 overflow-hidden"
      style={{ minWidth: '400px' }}
    >
      {shortcuts.map((shortcut: any, index: number) => (
        <Dropdown.Item
          key={shortcut.uuid}
          as="a"
          href={shortcut.link}
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex align-items-center py-5 ps-6 pe-2 position-relative"
        >
          {/* Show separator line only if there are multiple items and not the last item */}
          {shortcuts.length > 1 && index < shortcuts.length - 1 && (
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x border-bottom"
              style={{ width: 'calc(100% - 24px)' }}
            />
          )}
          <div className="me-5">
            <Avatar
              name={shortcut.name}
              src={shortcut.image}
              circle
              size={42}
            />
          </div>
          <div className="flex-grow-1 fs-4">
            <div className="fw-bolder">{shortcut.name}</div>
            {shortcut.description && (
              <div className="fw-normal text-muted mt-3">
                {shortcut.description}
              </div>
            )}
          </div>
          <div className="ms-2">
            <span className="svg-icon svg-icon-primary svg-icon-1x">
              <ArrowSquareOutIcon weight="bold" />
            </span>
          </div>
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  return (
    <div
      className="aside-logo flex-column-auto position-relative"
      id="kt_aside_logo"
    >
      {/* Shortcuts Button */}
      <div className="position-relative min-w-24px" ref={dropdownRef}>
        {shortcuts.length > 0 &&
          (!layout.config.aside.minimized || isAsideHovered) && (
            <>
              <button
                className="btn btn-icon btn-sm border-0 w-24px"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label={translate('Quick shortcuts')}
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <SquaresFourIcon size={24} weight="bold" />
              </button>
              {DropdownMenu}
            </>
          )}
      </div>
      {/* Logo */}
      <Link state="profile.details">
        {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE && sidebarLogo ? (
          <>
            <img
              src={sidebarLogoMobileUrl}
              alt="logo"
              className="logo_mobile"
            />

            <img src={sidebarLogo} alt="logo" className="logo" />
          </>
        ) : sidebarLogo ? (
          <img src={sidebarLogo} alt="logo" className="logo" />
        ) : (
          <h3 className="mt-2">{ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}</h3>
        )}
      </Link>
      {/* Minimizer Toggle */}
      <div className="min-w-24px">
        <div
          id="kt_aside_toggle"
          className="btn btn-icon btn-sm border-0 w-24px"
          data-kt-toggle="true"
          data-kt-toggle-state="active"
          data-kt-toggle-target="body"
          data-kt-toggle-name="aside-minimize"
          aria-hidden="true"
          onClick={toggleSidebar}
        >
          <span className="svg-icon svg-icon-1x">
            <SidebarToggleGraphic width={24} height={25} />
          </span>
        </div>
      </div>
    </div>
  );
};
