import { translate } from '@/i18n';

/** The warning shown when an OpenStack tenant is terminated. */
export const TenantDestroySubtitle = () => (
  <div>
    <p>
      {translate(
        'Deleting an OpenStack tenant also deletes all resources created within it.',
      )}
    </p>
    <p>{translate('Please make sure you have backed up your data.')}</p>
    <p>
      {translate(
        'In particular, the following items from this tenant will be deleted:',
      )}
    </p>
    <ul>
      <li>{translate('Virtual machines')}</li>
      <li>{translate('Volumes and snapshots')}</li>
      <li>{translate('Internal networks')}</li>
      <li>{translate('External networks (if they belong to the tenant)')}</li>
      <li>{translate('Security groups')}</li>
    </ul>
  </div>
);
