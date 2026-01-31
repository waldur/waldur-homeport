import { useCallback } from 'react';
import { Card, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import type { ArrowSettings } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { useArrowSettings } from '../api';

import { ArrowHowItWorksButton } from './ArrowHowItWorksButton';
import { ArrowSettingsActions } from './ArrowSettingsActions';

const ArrowSetupDialog = lazyComponent(() =>
  import('../setup/ArrowSetupDialog').then((module) => ({
    default: module.ArrowSetupDialog,
  })),
);

const ArrowSetupButton = () => {
  const dispatch = useDispatch();
  const openSetupDialog = useCallback(() => {
    dispatch(
      openModalDialog(ArrowSetupDialog, {
        size: 'lg',
      }),
    );
  }, [dispatch]);

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
  const currentSettings = settings ?? data;

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
                  <code>{currentSettings.api_url}</code>
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
                    <code>{currentSettings.partner_reference}</code>
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
