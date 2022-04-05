import copy from 'copy-to-clipboard';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const CopyToClipboardButton: FunctionComponent<{ value }> = ({
  value,
}) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    copy(value);
    dispatch(showSuccess(translate('Text has been copied')));
  }, [dispatch, value]);

  return (
    <p className="mb-2 mt-2">
      <a onClick={onClick}>
        <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
          <i className="fa fa-copy fa-lg" />
        </Tip>
      </a>
    </p>
  );
};
