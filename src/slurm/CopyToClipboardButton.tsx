import copy from 'copy-to-clipboard';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';

export const CopyToClipboardButton = ({ value }) => {
  const dispatch = useDispatch();

  const onClick = React.useCallback(() => {
    copy(value);
    dispatch(showSuccess(translate('Text has been copied')));
  }, [dispatch, value]);

  return (
    <p className="m-b-sm m-t-sm">
      <a onClick={onClick}>
        <Tooltip label={translate('Copy to clipboard')} id="copyToClipboard">
          <i className="fa fa-copy fa-lg" />
        </Tooltip>
      </a>
    </p>
  );
};
