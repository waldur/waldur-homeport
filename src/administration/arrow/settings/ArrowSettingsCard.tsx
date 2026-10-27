import { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import type { ArrowSettings } from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';

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
    <BaseButton
      onClick={openSetupDialog}
      label={translate('Setup Arrow Integration')}
      variant="primary"
      size="lg"
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
        <Card.Body className="text-center py-8">
          <h4 className="mb-3">
            {translate('Arrow Integration Not Configured')}
          </h4>
          <p className="text-quaternary mb-5">
            {translate(
              'Connect your Arrow (ArrowSphere) account to synchronize billing data with Waldur.',
            )}
          </p>
          <div className="flex gap-1.5 justify-center">
            <ArrowSetupButton />
            <ArrowHowItWorksButton />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <Card.Header className="flex justify-between items-center">
          <Card.Title>
            <h4 className="mb-0">{translate('Connection Settings')}</h4>
          </Card.Title>
          <div className="flex gap-1.5 items-center">
            <ArrowHowItWorksButton />
            <ArrowSettingsActions settings={currentSettings} />
          </div>
        </Card.Header>
        <Card.Body>
          <FormTable>
            <FormTable.Item
              label={translate('API URL')}
              value={
                <ExternalLink
                  url={currentSettings.api_url}
                  label={currentSettings.api_url}
                />
              }
            />
            <FormTable.Item
              label={translate('Partner Name')}
              value={renderFieldOrDash(currentSettings.partner_name)}
            />
            <FormTable.Item
              label={translate('Partner Reference')}
              value={
                currentSettings.partner_reference ? (
                  <span className="flex items-center gap-1.5">
                    {currentSettings.partner_reference}
                    <CopyToClipboardButton
                      value={currentSettings.partner_reference}
                      onlyButton
                    />
                  </span>
                ) : (
                  renderFieldOrDash(null)
                )
              }
            />
            <FormTable.Item
              label={translate('Export Type Reference')}
              value={
                currentSettings.export_type_reference ? (
                  <span className="flex items-center gap-1.5">
                    {currentSettings.export_type_reference}
                    <CopyToClipboardButton
                      value={currentSettings.export_type_reference}
                      onlyButton
                    />
                  </span>
                ) : (
                  renderFieldOrDash(null)
                )
              }
            />
            <FormTable.Item
              label={translate('Invoice Price Source')}
              value={
                currentSettings.invoice_price_source === 'buy'
                  ? translate('Buy price')
                  : translate('Sell price')
              }
            />
            <FormTable.Item
              label={translate('Invoice Item Prefix')}
              value={
                <>
                  <div>
                    {currentSettings.invoice_item_prefix || 'Arrow consumption'}
                  </div>
                  <div className="text-quaternary small mt-1">
                    {translate(
                      'Consumption items appear as "{prefix}: {resource name}" and adjustments as "{prefix} adjustment: {resource name} (additional charge|credit)".',
                      {
                        prefix:
                          currentSettings.invoice_item_prefix ||
                          'Arrow consumption',
                      },
                    )}
                  </div>
                </>
              }
            />
            <FormTable.Item
              label={translate('Sync Enabled')}
              value={
                <Badge
                  variant={currentSettings.sync_enabled ? 'success' : 'neutral'}
                  shape="pill"
                  tone="outline"
                >
                  {currentSettings.sync_enabled
                    ? translate('Yes')
                    : translate('No')}
                </Badge>
              }
            />
            <FormTable.Item
              label={translate('Created')}
              value={formatDateTime(currentSettings.created)}
            />
          </FormTable>
        </Card.Body>
      </Card>
    </div>
  );
};
