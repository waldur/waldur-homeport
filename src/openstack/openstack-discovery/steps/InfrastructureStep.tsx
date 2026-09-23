import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { Card, FormCheck, Spinner, Table } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  openstackDiscoveryDiscoverExternalNetworks,
  openstackDiscoveryDiscoverFlavors,
  openstackDiscoveryDiscoverInstanceAvailabilityZones,
  openstackDiscoveryDiscoverVolumeAvailabilityZones,
  openstackDiscoveryDiscoverVolumeTypes,
} from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatFilesize } from '@/core/utils';
import { SelectField } from '@/form';
import { FormGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { renderFieldOrDash } from '@/table/utils';
import { WizardModal, WizardStepProps } from '@/wizard';

import { extractCredentials, OpenStackDiscoveryFormValues } from '../types';

export const InfrastructureStep: FC<WizardStepProps> = (props) => {
  const form = useForm<OpenStackDiscoveryFormValues>();
  const { values } = useFormState<OpenStackDiscoveryFormValues>();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const discover = async () => {
      setLoading(true);
      setErrors({});

      const creds = extractCredentials(values);
      const results = await Promise.allSettled([
        openstackDiscoveryDiscoverExternalNetworks({ body: creds }),
        openstackDiscoveryDiscoverInstanceAvailabilityZones({ body: creds }),
        openstackDiscoveryDiscoverVolumeAvailabilityZones({ body: creds }),
        openstackDiscoveryDiscoverVolumeTypes({ body: creds }),
        openstackDiscoveryDiscoverFlavors({ body: creds }),
      ]);

      const newErrors: Record<string, string> = {};

      // External networks
      if (results[0].status === 'fulfilled') {
        const networks = results[0].value.data || [];
        form.change('externalNetworks', networks);
        if (networks.length === 1) {
          form.change('selectedExternalNetworkId', networks[0].id);
        }
      } else {
        newErrors.networks = translate('Failed to discover external networks');
      }

      // Instance AZs
      if (results[1].status === 'fulfilled') {
        const zones = (results[1].value.data || []).filter(
          (z) => z.state === 'available',
        );
        form.change('instanceAZs', zones);
      } else {
        newErrors.instanceAZs = translate(
          'Failed to discover instance availability zones',
        );
      }

      // Volume AZs
      if (results[2].status === 'fulfilled') {
        const zones = (results[2].value.data || []).filter(
          (z) => z.state === 'available',
        );
        form.change('volumeAZs', zones);
      } else {
        newErrors.volumeAZs = translate(
          'Failed to discover volume availability zones',
        );
      }

      // Volume types
      if (results[3].status === 'fulfilled') {
        form.change('volumeTypes', results[3].value.data || []);
      } else {
        newErrors.volumeTypes = translate('Failed to discover volume types');
      }

      // Flavors
      if (results[4].status === 'fulfilled') {
        form.change('flavors', results[4].value.data || []);
      } else {
        newErrors.flavors = translate('Failed to discover flavors');
      }

      setErrors(newErrors);
      setLoading(false);
    };

    discover();
  }, []);

  const instanceAZOptions = (values.instanceAZs || []).map((az) => ({
    value: az.name,
    label: az.name,
  }));

  const volumeAZOptions = (values.volumeAZs || []).map((az) => ({
    value: az.name,
    label: az.name,
  }));

  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={false}
        disabled={!values.selectedExternalNetworkId || loading}
        label={translate('Continue')}
        onClick={() => props.handleSubmit()}
        type="button"
        className="min-w-125px"
        iconNode={<CaretRightIcon weight="bold" />}
        data-testid="wizard-next-btn"
      />
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <div className="text-center py-10">
          <Spinner animation="border" />
          <p className="mt-4">
            {translate('Discovering OpenStack infrastructure...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      {/* External Networks */}
      <h4 className="mb-4">{translate('External Networks')}</h4>
      {errors.networks ? (
        <AlertItem
          type="floating"
          variant="error"
          title={errors.networks}
          className="mb-4"
        />
      ) : values.externalNetworks.length === 0 ? (
        <AlertItem
          type="floating"
          variant="warning"
          title={translate('No external networks found.')}
          className="mb-4"
        />
      ) : (
        <>
          <p className="text-muted mb-4">
            {translate('Select the external network for the offering.')}
          </p>
          <div className="row g-3 mb-6">
            {values.externalNetworks.map((network) => (
              <div key={network.id} className="col-md-6">
                <Card
                  className={`cursor-pointer h-100 ${
                    values.selectedExternalNetworkId === network.id
                      ? 'border-primary border-2'
                      : 'border-secondary'
                  }`}
                  onClick={() =>
                    form.change('selectedExternalNetworkId', network.id)
                  }
                >
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <FormCheck
                        type="radio"
                        className="me-3"
                        checked={
                          values.selectedExternalNetworkId === network.id
                        }
                        onChange={() =>
                          form.change('selectedExternalNetworkId', network.id)
                        }
                      />
                      <div>
                        <h5 className="mb-1">
                          {network.name}{' '}
                          {network.is_shared && (
                            <Badge variant="purple" tone="outline">
                              {translate('Shared')}
                            </Badge>
                          )}
                        </h5>
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <code>{network.id}</code>
                          <CopyToClipboardButton
                            value={network.id}
                            size={14}
                            onlyButton
                            verbose={translate('UUID')}
                          />
                        </div>
                        {network.subnets.length > 0 && (
                          <div className="text-muted small">
                            {network.subnets
                              .map((s) => `${s.name} (${s.cidr})`)
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Availability Zones */}
      <div className="row mb-6">
        <div className="col-sm-6">
          <FormGroup label={translate('Instance availability zone')}>
            {errors.instanceAZs ? (
              <AlertItem
                type="floating"
                variant="error"
                title={errors.instanceAZs}
                className="mb-0"
              />
            ) : instanceAZOptions.length > 0 ? (
              <Field name="selectedInstanceAZ">
                {({ input, meta }) => (
                  <SelectField
                    input={input}
                    meta={meta}
                    options={instanceAZOptions}
                    simpleValue
                    isClearable
                  />
                )}
              </Field>
            ) : (
              <p className="text-muted mb-0">
                {translate('No instance availability zones found.')}
              </p>
            )}
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup label={translate('Volume availability zone')}>
            {errors.volumeAZs ? (
              <AlertItem
                type="floating"
                variant="error"
                title={errors.volumeAZs}
                className="mb-0"
              />
            ) : volumeAZOptions.length > 0 ? (
              <Field name="selectedVolumeAZ">
                {({ input, meta }) => (
                  <SelectField
                    input={input}
                    meta={meta}
                    options={volumeAZOptions}
                    simpleValue
                    isClearable
                  />
                )}
              </Field>
            ) : (
              <p className="text-muted mb-0">
                {translate('No volume availability zones found.')}
              </p>
            )}
          </FormGroup>
        </div>
      </div>

      {/* Volume Types (informational) */}
      {!errors.volumeTypes && values.volumeTypes.length > 0 && (
        <div className="mb-6">
          <h5 className="mb-3">{translate('Volume Types')}</h5>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>{translate('Name')}</th>
                <th>{translate('Description')}</th>
              </tr>
            </thead>
            <tbody>
              {values.volumeTypes.map((vt) => (
                <tr key={vt.id}>
                  <td>{vt.name}</td>
                  <td className="text-muted">
                    {renderFieldOrDash(vt.description)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Flavors (informational) */}
      {!errors.flavors && values.flavors.length > 0 && (
        <div className="mb-6">
          <h5 className="mb-3">{translate('Flavors')}</h5>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>{translate('Name')}</th>
                <th>{translate('vCPUs')}</th>
                <th>{translate('RAM')}</th>
                <th>{translate('Disk')}</th>
              </tr>
            </thead>
            <tbody>
              {values.flavors.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.vcpus}</td>
                  <td>{formatFilesize(f.ram, 'MB')}</td>
                  <td>{f.disk} GB</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </WizardModal>
  );
};
