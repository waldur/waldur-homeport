import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  openstackDiscoveryDiscoverExternalNetworks,
  openstackDiscoveryDiscoverFlavors,
  openstackDiscoveryDiscoverInstanceAvailabilityZones,
  openstackDiscoveryDiscoverVolumeAvailabilityZones,
  openstackDiscoveryDiscoverVolumeTypes,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  Card,
  CardContent,
  Code,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatFilesize } from '@/core/utils';
import { SelectField, SubmitButton } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { renderFieldOrDash } from '@/table/utils';
import { StepLoading, WizardModal, WizardStepProps } from '@/wizard';

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
      <BaseButton
        variant="tertiary"
        className="min-w-dialog-action me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton />
      <SubmitButton
        submitting={loading}
        disabled={!values.selectedExternalNetworkId || loading}
        label={translate('Continue')}
        onClick={() => props.handleSubmit()}
        iconNode={<CaretRightIcon weight="bold" />}
        data-testid="wizard-next-btn"
      />
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <StepLoading
          message={translate('Discovering OpenStack infrastructure...')}
        />
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      {/* External Networks */}
      <h4 className="mb-3">{translate('External Networks')}</h4>
      {errors.networks ? (
        <AlertItem
          type="floating"
          variant="error"
          title={errors.networks}
          className="mb-3"
        />
      ) : values.externalNetworks.length === 0 ? (
        <AlertItem
          type="floating"
          variant="warning"
          title={translate('No external networks found.')}
          className="mb-3"
        />
      ) : (
        <>
          <p className="text-quaternary mb-3">
            {translate('Select the external network for the offering.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
            {values.externalNetworks.map((network) => (
              <div key={network.id}>
                {}
                <Card
                  className={`cursor-pointer h-full ${
                    values.selectedExternalNetworkId === network.id
                      ? 'border-brand border-2'
                      : 'border-secondary'
                  }`}
                  onClick={() =>
                    form.change('selectedExternalNetworkId', network.id)
                  }
                >
                  <CardContent>
                    <div className="flex items-start">
                      <Radio
                        className="me-2.5"
                        aria-label={network.name}
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
                        <div className="flex items-center text-quaternary small mb-1">
                          <Code>{network.id}</Code>
                          <CopyToClipboardButton
                            value={network.id}
                            size={14}
                            onlyButton
                            verbose={translate('UUID')}
                          />
                        </div>
                        {network.subnets.length > 0 && (
                          <div className="text-quaternary small">
                            {network.subnets
                              .map((s) => `${s.name} (${s.cidr})`)
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Availability Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 mb-5">
        <div>
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
              <p className="text-quaternary mb-0">
                {translate('No instance availability zones found.')}
              </p>
            )}
          </FormGroup>
        </div>
        <div>
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
              <p className="text-quaternary mb-0">
                {translate('No volume availability zones found.')}
              </p>
            )}
          </FormGroup>
        </div>
      </div>

      {/* Volume Types (informational) */}
      {!errors.volumeTypes && values.volumeTypes.length > 0 && (
        <div className="mb-5">
          <h5 className="mb-2.5">{translate('Volume Types')}</h5>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Name')}</TableHead>
                <TableHead>{translate('Description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.volumeTypes.map((vt) => (
                <TableRow key={vt.id}>
                  <TableCell>{vt.name}</TableCell>
                  <TableCell className="text-quaternary">
                    {renderFieldOrDash(vt.description)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Flavors (informational) */}
      {!errors.flavors && values.flavors.length > 0 && (
        <div className="mb-5">
          <h5 className="mb-2.5">{translate('Flavors')}</h5>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Name')}</TableHead>
                <TableHead>{translate('vCPUs')}</TableHead>
                <TableHead>{translate('RAM')}</TableHead>
                <TableHead>{translate('Disk')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.flavors.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.vcpus}</TableCell>
                  <TableCell>{formatFilesize(f.ram, 'MB')}</TableCell>
                  <TableCell>{f.disk} GB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </WizardModal>
  );
};
