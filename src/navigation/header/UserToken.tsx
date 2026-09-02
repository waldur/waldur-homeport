import { CopyIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

/**
 * Plain content inside UserDropdown's NavMenuContent, not a NavMenuItem —
 * see ThemeSwitcher's comment. This row holds a readonly token field and
 * its own Copy button; selecting either shouldn't dismiss the menu.
 */
export const UserToken = ({ token }) => {
  const { showSuccess } = useNotify();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(token).then(() => {
      showSuccess(translate('Token has been copied'));
    });
  }, [token]);

  return (
    <div className="menu-item">
      <div className="menu-link bg-transparent">
        <span className="menu-title me-2 text-nowrap">
          {translate('API token')}
        </span>
        <InputGroup>
          <FormControl
            value={token}
            readOnly={true}
            className="form-control-solid h-30px"
            size="sm"
            placeholder={translate('Token')}
            style={{
              fontFamily: 'text-security-disc',
            }}
          />

          <CompactSubmitButton
            submitting={false}
            type="button"
            variant="primary"
            className="px-3 h-30px"
            onClick={onClick}
            label={translate('Copy')}
            iconNode={<CopyIcon weight="bold" />}
            iconOnLeft
          />
        </InputGroup>
      </div>
    </div>
  );
};
