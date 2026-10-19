import { ChartBarIcon, TableIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  marketplaceProviderOfferingsList,
  marketplaceProviderOfferingsTosStatsRetrieve,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  FormField,
  FormLabel,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { TosAcceptedTrendChart } from './TosAcceptedTrendChart';
import { TosConsentStatusChart } from './TosConsentStatusChart';
import { TosDataTables } from './TosDataTables';
import { TosRevokedTrendChart } from './TosRevokedTrendChart';
import { TosVersionAdoptionChart } from './TosVersionAdoptionChart';

interface TosReportingModalProps {
  resolve: {
    offeringUuid?: string;
    providerUuid?: string;
  };
}

type ViewType =
  'versionAdoption' | 'consentStatus' | 'acceptedTrend' | 'revokedTrend';

export const TosReportingModal: FC<TosReportingModalProps> = ({
  resolve: { offeringUuid: initialOfferingUuid, providerUuid },
}) => {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  const [selectedView, setSelectedView] = useState<ViewType>('versionAdoption');
  const [selectedOffering, setSelectedOffering] = useState(initialOfferingUuid);

  // Fetch offerings if providerUuid is provided
  const {
    data: offerings,
    isLoading: isLoadingOfferings,
    error: offeringsError,
  } = useQuery({
    queryKey: ['provider-offerings', providerUuid],
    queryFn: async () => {
      const response = await marketplaceProviderOfferingsList({
        query: { customer_uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
    staleTime: STALE_TIME,
  });

  // Fetch ToS statistics for selected offering
  const { data, isLoading, error } = useQuery({
    queryKey: ['tos-stats', selectedOffering],
    queryFn: async () => {
      const response = await marketplaceProviderOfferingsTosStatsRetrieve({
        path: { uuid: selectedOffering },
      });
      return response.data;
    },
    enabled: !!selectedOffering,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const offeringOptions = useMemo(() => {
    if (!offerings) return [];
    return offerings.map((offering) => ({
      value: offering.uuid,
      label: offering.name,
    }));
  }, [offerings]);

  const viewOptions = [
    {
      value: 'versionAdoption' as ViewType,
      label: translate('Version adoption'),
    },
    { value: 'consentStatus' as ViewType, label: translate('Consent status') },
    { value: 'acceptedTrend' as ViewType, label: translate('Accepted trend') },
    { value: 'revokedTrend' as ViewType, label: translate('Revoked trend') },
  ];

  return (
    <ModalDialog title={translate('ToS acceptance statistics')}>
      {providerUuid && (
        <FormField className="mb-4">
          <FormLabel>{translate('Select offering')}</FormLabel>
          {isLoadingOfferings ? (
            <LoadingSpinner />
          ) : offeringsError ? (
            <AlertItem
              type="floating"
              variant="error"
              title={translate('Unable to load offerings.')}
            />
          ) : (
            <Select
              value={offeringOptions.find(
                (opt) => opt.value === selectedOffering,
              )}
              onChange={(option) => setSelectedOffering(option?.value)}
              options={offeringOptions}
              isClearable={false}
              placeholder={translate('Select offering')}
            />
          )}
        </FormField>
      )}

      {!selectedOffering && (
        <AlertItem
          type="floating"
          variant="info"
          title={translate('Please select an offering to view statistics.')}
        />
      )}

      {selectedOffering && isLoading && (
        <div className="flex justify-center items-center py-5">
          <LoadingSpinner />
        </div>
      )}
      {selectedOffering && error && (
        <AlertItem
          type="floating"
          variant="error"
          title={translate('Unable to load ToS statistics.')}
        />
      )}
      {selectedOffering && !isLoading && !error && data && (
        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as ViewType)}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              {viewOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <BaseButton
              tooltip={
                mode === 'chart'
                  ? translate('Show as table')
                  : translate('Show as chart')
              }
              variant="tertiary"
              size="sm"
              onClick={() =>
                setMode((prev) => (prev === 'chart' ? 'table' : 'chart'))
              }
              iconNode={
                mode === 'chart' ? (
                  <TableIcon weight="bold" />
                ) : (
                  <ChartBarIcon weight="bold" />
                )
              }
            />
          </div>

          <TabsContent value={selectedView}>
            {mode === 'chart' ? (
              <>
                {selectedView === 'versionAdoption' && (
                  <TosVersionAdoptionChart data={data} />
                )}
                {selectedView === 'consentStatus' && (
                  <TosConsentStatusChart data={data} />
                )}
                {selectedView === 'acceptedTrend' && (
                  <TosAcceptedTrendChart data={data} />
                )}
                {selectedView === 'revokedTrend' && (
                  <TosRevokedTrendChart data={data} />
                )}
              </>
            ) : (
              <TosDataTables data={data} selectedTable={selectedView} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </ModalDialog>
  );
};
