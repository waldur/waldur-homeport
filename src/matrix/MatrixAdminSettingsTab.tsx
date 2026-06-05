import { useQuery } from '@tanstack/react-query';
import {
  adminMatrixAppserviceStatusRetrieve,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { FieldRow } from '@/administration/settings/FieldRow';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';
import { renderFieldOrDash } from '@/table/utils';

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

  const { data: status } = useQuery({
    queryKey: ['matrixAppserviceStatus'],
    queryFn: () => adminMatrixAppserviceStatusRetrieve().then((r) => r.data),
  });

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

  return (
    <>
      <FormTable>
        {group.items.map((item) => (
          <FieldRow item={item} key={item.key} value={settings[item.key]} />
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
