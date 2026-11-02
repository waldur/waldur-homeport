import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { AlertItem, PropertyCard, PropertyList, PropertyItem } from 'waldur-ui';

import { SettingsPropertyList } from '@/administration/settings/SettingsPropertyList';
import { getKeyTitle } from '@/administration/settings/utils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { SettingsDescription } from '@/SettingsDescription';

import {
  getDeploymentLockedKeys,
  useMatrixAppserviceStatus,
} from './useMatrixAppserviceStatus';

export const MatrixAdminSettingsTab = () => {
  const {
    data: settings,
    error: settingsError,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['MatrixAdminSettings'],
    queryFn: () => overrideSettingsRetrieve().then((r) => r.data),
  });

  const { data: status } = useMatrixAppserviceStatus();

  if (settingsLoading) return <LoadingSpinner />;
  if (settingsError)
    return (
      <LoadingErred
        message={translate('Unable to load Matrix settings.')}
        loadData={refetchSettings}
      />
    );

  const group = SettingsDescription.find(
    (g) => g.description === translate('Matrix chat'),
  );

  if (!group || !settings) return null;

  // Read from the settings rather than the status, so the rows are never
  // editable while a second request is still loading.
  const lockedKeys = getDeploymentLockedKeys(settings);

  return (
    <>
      {lockedKeys.length > 0 && (
        <AlertItem
          type="floating"
          variant="info"
          className="mb-4"
          title={translate('These settings are managed by the deployment')}
          body={
            <>
              <p>
                {translate(
                  'The deployment writes these settings on every deploy, so they are locked on this page: {settings}.',
                  {
                    settings: lockedKeys
                      .map((key) => getKeyTitle(key))
                      .join(', '),
                  },
                )}
              </p>
              <p className="mb-0">
                {translate(
                  'To change them or rotate the appservice tokens, change them where the deployment keeps them and redeploy: for Helm, in the values and Secrets; for Docker Compose, in .env, with the appservice tokens in secrets.env on the secrets volume (see Token rotation in the Matrix chat add-on docs). A change made here some other way is reverted at the next deploy. Clear "Matrix tokens managed by" only if the deployment no longer sets up Matrix.',
                )}
              </p>
            </>
          }
        />
      )}
      <SettingsPropertyList
        items={group.items}
        values={settings}
        getEditDisabledReason={(item) =>
          lockedKeys.includes(item.key)
            ? translate(
                'Set by the deployment on every deploy. Change it there and redeploy.',
              )
            : undefined
        }
      />
      {status && (
        <PropertyCard
          bordered
          title={translate('Runtime status')}
          className="mt-4"
        >
          <PropertyList hideActions detailsMode>
            <PropertyItem
              label={translate('Bot user ID')}
              value={status.bot_user_id}
            />
            <PropertyItem
              label={translate('Webhook path')}
              value={propVal.code(status.webhook_path)}
              hasCopy
            />
            <PropertyItem
              label={translate('Transactions processed')}
              value={propVal.number(status.transaction_count)}
            />
          </PropertyList>
        </PropertyCard>
      )}
    </>
  );
};
