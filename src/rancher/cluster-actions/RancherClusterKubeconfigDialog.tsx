import * as React from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { copyToClipboard } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

const getKubeconfigFile = resourceId =>
  get(`/rancher-clusters/${resourceId}/kubeconfig_file/`)
  .then(response => response.data.config);

const KubeconfigFilePanel = props => (
  <>
    <p>
      {translate('Put this into ~/.kube/config:')}
    </p>
    <pre style={{height: 200}}>{props.config}</pre>
    <a onClick={() => copyToClipboard(props.config)}>
      {translate('Copy to clipboard')}
    </a>
    <p>
      <a href="http://kubernetes.io/docs/user-guide/prereqs/">
        {translate('Then download (if needed) and run kubectl')}
      </a>
    </p>
  </>
);

export const RancherClusterKubeconfigDialog = props => {
  const {state: resourceProps, call: loadResource} = useQuery(getKubeconfigFile, props.resolve.resource.uuid);
  React.useEffect(loadResource, []);
  return (
    <ModalDialog
      title={translate('Kubeconfig file')}
      footer={<CloseDialogButton/>}>
      {resourceProps.loading ? <LoadingSpinner/> :
      resourceProps.erred ? <div>{translate('Unable to load data.')}</div> :
      resourceProps.loaded ? <KubeconfigFilePanel config={resourceProps.data}/> : null}
    </ModalDialog>
  );
};

export default connectAngularComponent(RancherClusterKubeconfigDialog, ['resolve']);
