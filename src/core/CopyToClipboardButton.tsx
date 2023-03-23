import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const CopyToClipboardButton: FunctionComponent<{ value; className? }> =
  ({ value, className }) => {
    const dispatch = useDispatch();

    const onClick = useCallback(
      (event) => {
        event.stopPropagation();
        copy(value);
        dispatch(showSuccess(translate('Text has been copied')));
      },
      [dispatch, value],
    );

    return (
      <p className={classNames('my-2', className)}>
        <a onClick={(e) => onClick(e)}>
          <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
            <i className="fa fa-copy fa-lg" />
          </Tip>
        </a>
      </p>
    );
  };
