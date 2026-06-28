import { useCallback } from 'react';
import { Card, Table } from 'react-bootstrap';
import type { ArrowSettings } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { useArrowSettings } from '../api';

import { ArrowHowItWorksButton } from './ArrowHowItWorksButton';
import { ArrowSettingsActions } from './ArrowSettingsActions';

const ArrowSetupDialog = lazyComponent(() =>
  import('../setup/ArrowSetupDialog').then((module) => ({
    default: module.ArrowSetupDialog,
  })),
);

const ArrowSetupButton = () => {
  const { openDialog } = useModal();
  const openSetupDialog = useCallback(() => {
    openDialog(ArrowSetupDialog, {
      size: 'lg',
    });
  }, []);

  return (
    <ActionButton
      action={openSetupDialog}
      title={translate('Setup Arrow Integration')}
      variant="primary"
    />
  );
};

interface ArrowSettingsCardProps {
  settings?: ArrowSettings | null;
}

export const ArrowSettingsCard = ({ settings }: ArrowSettingsCardProps) => {
  const { data, isLoading, error, refetch } = useArrowSettings();
  const currentSettings = (settings ?? data) as
    ArrowSettings | null | undefined;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        message={translate('Failed to load Arrow settings')}
        loadData={refetch}
      />
    );
  }

  if (!currentSettings) {
    return (
      <Card>
        <Card.Body className="text-center py-10">
          <h4 className="mb-4">
            {translate('Arrow Integration Not Configured')}
          </h4>
          <p className="text-muted mb-6">
            {translate(
              'Connect your Arrow (ArrowSphere) account to synchronize billing data with Waldur.',
            )}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <ArrowSetupButton />
            <ArrowHowItWorksButton />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-6">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title>
            <h4 className="mb-0">{translate('Connection Settings')}</h4>
          </Card.Title>
          <div className="d-flex gap-2 align-items-center">
            <ArrowHowItWorksButton />
            <ArrowSettingsActions settings={currentSettings} />
          </div>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '30%' }}>
                  {translate('API URL')}
                </td>
                <td>
                  <ExternalLink
                    url={currentSettings.api_url}
                    label={currentSettings.api_url}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Partner Name')}</td>
                <td>{currentSettings.partner_name || DASH_ESCAPE_CODE}</td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Partner Reference')}</td>
                <td>
                  {currentSettings.partner_reference ? (
                    <span className="d-flex align-items-center gap-2">
                      {currentSettings.partner_reference}
                      <CopyToClipboardButton
                        value={currentSettings.partner_reference}
                        onlyButton
                      />
                    </span>
                  ) : (
                    DASH_ESCAPE_CODE
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Export Type Reference')}
                </td>
                <td>
                  {currentSettings.export_type_reference ? (
                    <span className="d-flex align-items-center gap-2">
                      {currentSettings.export_type_reference}
                      <CopyToClipboardButton
                        value={currentSettings.export_type_reference}
                        onlyButton
                      />
                    </span>
                  ) : (
                    DASH_ESCAPE_CODE
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Invoice Price Source')}
                </td>
                <td>
                  {currentSettings.invoice_price_source === 'buy'
                    ? translate('Buy price')
                    : translate('Sell price')}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Invoice Item Prefix')}
                </td>
                <td>
                  <div>
                    {currentSettings.invoice_item_prefix || 'Arrow consumption'}
                  </div>
                  <div className="text-muted small mt-1">
                    {translate(
                      'Consumption items appear as "{prefix}: {resource name}" and adjustments as "{prefix} adjustment: {resource name} (additional charge|credit)".',
                      {
                        prefix:
                          currentSettings.invoice_item_prefix ||
                          'Arrow consumption',
                      },
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Sync Enabled')}</td>
                <td>
                  <Badge
                    variant={
                      currentSettings.sync_enabled ? 'success' : 'default'
                    }
                    pill
                    outline
                  >
                    {currentSettings.sync_enabled
                      ? translate('Yes')
                      : translate('No')}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Created')}</td>
                <td>{formatDateTime(currentSettings.created)}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};
