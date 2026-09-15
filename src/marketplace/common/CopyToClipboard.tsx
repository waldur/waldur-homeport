import { CopyIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import './CopyToClipboard.scss';

interface CopyToClipboardProps {
  value: string;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
}) => {
  const { showSuccess } = useNotify();
  const onClick = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      showSuccess(translate('Text has been copied'));
    });
  }, [value]);
  return (
    <div className="copyToClipboard">
      <button className="text-btn" type="button" onClick={onClick}>
        <Tooltip label={translate('Copy to clipboard')}>
          <CopyIcon weight="bold" />
        </Tooltip>
      </button>
    </div>
  );
};
