import { useCallback } from 'react';
import type { ArrowSettings } from 'waldur-js-client';

import {
  BaseButton,
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { propVal } from '@/property/propertyFields';

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
        <CardContent className="text-center py-8">
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
        </CardContent>
      </Card>
    );
  }

  // What invoice items start with when no prefix is set, as the backend does.
  const prefix = currentSettings.invoice_item_prefix || 'Arrow consumption';

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle as="div">
            <h4 className="mb-0">{translate('Connection Settings')}</h4>
          </CardTitle>
          <div className="flex gap-1.5 items-center">
            <ArrowHowItWorksButton />
            <ArrowSettingsActions settings={currentSettings} />
          </div>
        </CardHeader>
        <CardContent>
          <PropertyList>
            <PropertyItem
              value={propVal.url(currentSettings.api_url)}
              label={translate('API URL')}
            />
            <PropertyItem
              value={currentSettings.partner_name}
              label={translate('Partner Name')}
            />
            <PropertyItem
              value={propVal.code(currentSettings.partner_reference)}
              label={translate('Partner Reference')}
              hasCopy
            />
            <PropertyItem
              value={propVal.code(currentSettings.export_type_reference)}
              label={translate('Export Type Reference')}
              hasCopy
            />
            <PropertyItem
              value={propVal.enum(currentSettings.invoice_price_source, {
                labels: {
                  buy: translate('Buy price'),
                  sell: translate('Sell price'),
                },
              })}
              label={translate('Invoice Price Source')}
            />
            <PropertyItem
              label={translate('Invoice Item Prefix')}
              value={
                <>
                  <div>{prefix}</div>
                  <div className="text-quaternary small mt-1">
                    {translate(
                      'Consumption items appear as "{prefix}: {resource name}" and adjustments as "{prefix} adjustment: {resource name} (additional charge|credit)".',
                      { prefix },
                    )}
                  </div>
                </>
              }
            />
            <PropertyItem
              value={propVal.boolean(currentSettings.sync_enabled, {
                display: 'badge',
              })}
              label={translate('Sync Enabled')}
            />
            <PropertyItem
              value={propVal.date(currentSettings.created, {
                precision: 'datetime',
              })}
              label={translate('Created')}
            />
          </PropertyList>
        </CardContent>
      </Card>
    </div>
  );
};
