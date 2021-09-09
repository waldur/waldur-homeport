import copy from 'copy-to-clipboard';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';
import './CopyToClipboard.scss';

/**
 * @param value Which is copied to the clipboard
 */
interface CopyToClipboardProps {
  value: string;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
}) => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    copy(value);
    dispatch(showSuccess(translate('Text has been copied')));
  }, [dispatch, value]);
  return (
    <div className="copyToClipboard">
      <a onClick={onClick}>
        <Tooltip label={translate('Copy to clipboard')} id="copyToClipboard">
          <i className="fa fa-clone fa-lg" />
        </Tooltip>
      </a>
    </div>
  );
};
