import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { copyToClipboard } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getKubeconfigFile } from '@waldur/rancher/api';
import { showSuccess } from '@waldur/store/coreSaga';

const KubeconfigFilePanel = props => {
  const dispatch = useDispatch();
  const onClick = React.useCallback(() => {
    copyToClipboard(props.config);
    dispatch(showSuccess(translate('File has been copied')));
  }, []);

  return (
    <>
      <p>{translate('Put this into ~/.kube/config:')}</p>
      <pre style={{ height: 200 }}>{props.config}</pre>
      <p className="m-b-sm m-t-sm">
        <a onClick={onClick}>
          <i className="fa fa-copy" /> {translate('Copy to clipboard')}
        </a>
      </p>
      <p>
        <a
          href="http://kubernetes.io/docs/user-guide/prereqs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate('Then download (if needed) and run kubectl')}
        </a>
      </p>
    </>
  );
};

export const RancherClusterKubeconfigDialog = props => {
  const { loading, error, value } = useAsync(() =>
    getKubeconfigFile(props.resolve.resource.uuid),
  );
  return (
    <ModalDialog
      title={translate('Kubeconfig file')}
      footer={<CloseDialogButton />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div>{translate('Unable to load data.')}</div>
      ) : (
        <KubeconfigFilePanel config={value} />
      )}
    </ModalDialog>
  );
};
