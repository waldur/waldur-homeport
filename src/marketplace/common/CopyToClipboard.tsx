import { CopyIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { showSuccess } from '@/store/notify';

import './CopyToClipboard.scss';

interface CopyToClipboardProps {
  value: string;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
}) => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      dispatch(showSuccess(translate('Text has been copied')));
    });
  }, [dispatch, value]);
  return (
    <div className="copyToClipboard">
      <button className="text-btn" type="button" onClick={onClick}>
        <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
          <CopyIcon weight="bold" />
        </Tip>
      </button>
    </div>
  );
};
