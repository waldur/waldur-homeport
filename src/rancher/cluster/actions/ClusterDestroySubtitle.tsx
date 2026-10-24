import { translate } from '@/i18n';

/** The warning shown when a Rancher cluster is terminated. */
export const ClusterDestroySubtitle = () => (
  <div>
    <p>
      {translate(
        'Deleting a cluster also deletes the infrastructure its Kubernetes nodes run on:',
      )}
    </p>
    <ul>
      <li>{translate('VMs')}</li>
      <li>{translate('Volumes')}</li>
    </ul>
    <p>
      {translate(
        'Unlink the VMs from their Kubernetes nodes first if you want to keep them.',
      )}
    </p>
  </div>
);
