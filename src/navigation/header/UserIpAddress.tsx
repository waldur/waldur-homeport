import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';

/**
 * Plain content inside UserDropdown's NavMenuContent, not a NavMenuItem —
 * see ThemeSwitcher's comment; this row's own Copy button shouldn't
 * dismiss the menu on click either.
 */
export const UserIpAddress = ({ ip }) => (
  <div className="menu-item">
    <div className="menu-link bg-transparent">
      <div className="menu-title me-2 text-nowrap">
        <div className="flex-grow-1">
          <span className="d-block mb-2">{translate('IP address')}:</span>
          <div className="d-flex justify-content-between text-muted">
            <span>{ip}</span>
            <CopyToClipboardButton
              value={ip}
              onlyButton
              size={20}
              verbose={translate('IP address')}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
