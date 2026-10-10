import { useQuery } from '@tanstack/react-query';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { FieldRow } from '@/administration/settings/FieldRow';
import { getKeyTitle } from '@/administration/settings/utils';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';
import { renderFieldOrDash } from '@/table/utils';

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
          className="mb-5"
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
      <FormTable>
        {group.items.map((item) => (
          <FieldRow
            item={item}
            key={item.key}
            value={settings[item.key]}
            editDisabledReason={
              lockedKeys.includes(item.key)
                ? translate(
                    'Set by the deployment on every deploy. Change it there and redeploy.',
                  )
                : undefined
            }
          />
        ))}
      </FormTable>
      {status && (
        <FormTable.Card
          title={translate('Runtime status')}
          className="card-bordered mt-5"
        >
          <table className="table table-borderless mb-0">
            <tbody>
              <tr>
                <td className="fw-bold text-nowrap pe-4">
                  {translate('Bot user ID')}
                </td>
                <td>{renderFieldOrDash(status.bot_user_id)}</td>
              </tr>
              <tr>
                <td className="fw-bold text-nowrap pe-4">
                  {translate('Webhook path')}
                </td>
                <td>
                  {status.webhook_path ? (
                    <div className="d-flex align-items-center gap-2">
                      <code>{status.webhook_path}</code>
                      <CopyToClipboardButton value={status.webhook_path} />
                    </div>
                  ) : (
                    renderFieldOrDash(null)
                  )}
                </td>
              </tr>
              <tr>
                <td className="fw-bold text-nowrap pe-4">
                  {translate('Transactions processed')}
                </td>
                <td>{status.transaction_count}</td>
              </tr>
            </tbody>
          </table>
        </FormTable.Card>
      )}
    </>
  );
};
