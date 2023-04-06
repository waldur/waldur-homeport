import copy from 'copy-to-clipboard';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const IPList = ({ value }) => {
  const dispatch = useDispatch();

  const copyIp = useCallback(
    (ip) => {
      copy(ip);
      dispatch(showSuccess(translate('{ip} has been copied', { ip })));
    },
    [dispatch],
  );

  if (Array.isArray(value) && value.filter(Boolean).length > 0) {
    return (
      <>
        {value.map((ip) => (
          <span key={ip} className="text-nowrap">
            {ip}
            <button
              className="btn btn-sm btn-icon btn-active-light-primary ms-1 position-relative z-index-1"
              onClick={() => copyIp(ip)}
            >
              <i className="fa fa-copy" />
            </button>
          </span>
        ))}
      </>
    );
  }
  return <>–</>;
};
