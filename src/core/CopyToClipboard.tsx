import copy from 'copy-to-clipboard';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const CopyToClipboard: FunctionComponent<{ value }> = ({ value }) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    copy(value);
    dispatch(showSuccess(translate('File has been copied')));
  }, [dispatch, value]);

  return (
    <p className="m-b-sm m-t-sm">
      <a onClick={onClick}>
        <i className="fa fa-copy fa-lg" /> {translate('Copy to clipboard')}
      </a>
    </p>
  );
};
