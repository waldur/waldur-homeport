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
      <Tooltip label={translate('Copy to clipboard')}>
        <button
          className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-secondary inline-flex items-center"
          type="button"
          aria-label={translate('Copy to clipboard')}
          onClick={onClick}
        >
          <CopyIcon weight="bold" />
        </button>
      </Tooltip>
    </div>
  );
};
