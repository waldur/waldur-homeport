import { ChartBarIcon, TableIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import {
  marketplaceProviderOfferingsList,
  marketplaceProviderOfferingsTosStatsRetrieve,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { TosAcceptedTrendChart } from './TosAcceptedTrendChart';
import { TosConsentStatusChart } from './TosConsentStatusChart';
import { TosDataTables } from './TosDataTables';
import { TosRevokedTrendChart } from './TosRevokedTrendChart';
import { TosVersionAdoptionChart } from './TosVersionAdoptionChart';

interface TosReportingModalProps {
  offeringUuid?: string;
  providerUuid?: string;
  onClose: () => void;
}

type ViewType =
  'versionAdoption' | 'consentStatus' | 'acceptedTrend' | 'revokedTrend';

export const TosReportingModal: FC<TosReportingModalProps> = ({
  offeringUuid: initialOfferingUuid,
  providerUuid,
  onClose,
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
    <Modal show onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{translate('ToS acceptance statistics')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {providerUuid && (
          <div className="mb-4">
            <Form.Label>{translate('Select offering')}</Form.Label>
            {isLoadingOfferings ? (
              <LoadingSpinner />
            ) : offeringsError ? (
              <div className="alert alert-danger" role="alert">
                {translate('Unable to load offerings.')}
              </div>
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
          </div>
        )}

        {!selectedOffering && (
          <div className="alert alert-info" role="alert">
            {translate('Please select an offering to view statistics.')}
          </div>
        )}

        {selectedOffering && isLoading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <LoadingSpinner />
          </div>
        )}
        {selectedOffering && error && (
          <div className="alert alert-danger" role="alert">
            {translate('Unable to load ToS statistics.')}
          </div>
        )}
        {selectedOffering && !isLoading && !error && data && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <ul className="nav nav-tabs nav-line-tabs">
                {viewOptions.map((option) => (
                  <li className="nav-item" key={option.value}>
                    <button
                      type="button"
                      className={`nav-link ${
                        selectedView === option.value ? 'active' : ''
                      }`}
                      onClick={() => setSelectedView(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-icon btn-sm btn-light"
                onClick={() =>
                  setMode((prev) => (prev === 'chart' ? 'table' : 'chart'))
                }
              >
                <span className="svg-icon svg-icon-2">
                  {mode === 'chart' ? (
                    <TableIcon weight="bold" />
                  ) : (
                    <ChartBarIcon weight="bold" />
                  )}
                </span>
              </button>
            </div>

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
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
