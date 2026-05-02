import { CopyIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const UserToken = ({ token }) => {
  const { showSuccess } = useNotify();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(token).then(() => {
      showSuccess(translate('Token has been copied'));
    });
  }, [token]);

  return (
    <div className="menu-item" data-kt-menu-trigger="click">
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
