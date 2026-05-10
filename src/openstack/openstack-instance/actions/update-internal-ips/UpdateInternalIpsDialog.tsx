import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useToggle } from 'react-use';
import {
  OpenStackCreatePortRequest,
  OpenStackInstance,
  openstackInstancesUpdatePorts,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSubnets } from '@/openstack/api';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { PortRows } from './PortRows';

interface PortFormEntry {
  subnet: any;
  fixed_ip?: string;
}

interface FormData {
  ports: PortFormEntry[];
}

interface UpdateInternalIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
    refetch?;
  };
}

export const UpdateInternalIpsDialog: FC<UpdateInternalIpsDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const {
    data: subnets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['UpdateInternalIpsDialog', resource.tenant_uuid],
    queryFn: () => loadSubnets({ tenant_uuid: resource.tenant_uuid }),
  });

  const { mutateAsync } = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      openstackInstancesUpdatePorts({
        path: { uuid: resource.uuid },
        body: {
          ports: formData.ports.map((item) => {
            const port: OpenStackCreatePortRequest = {
              subnet: item.subnet.url,
            };
            if (item.fixed_ip) {
              port.fixed_ips = [
                {
                  ip_address: item.fixed_ip,
                  subnet_id: item.subnet.backend_id,
                },
              ];
            }
            return port;
          }),
        },
      }),
    successMessage: translate(
      'Update of OpenStack instance internal IPs has been scheduled.',
    ),
    errorMessage: translate(
      'Unable to update internal IPs of OpenStack instance.',
    ),
    refetch,
  });

  const initialValues = useMemo<FormData>(() => {
    return {
      ports: resource.ports.map((item) => {
        const fullSubnet = subnets?.find((s) => s.uuid === item.subnet_uuid);
        return {
          subnet: fullSubnet || {
            url: item.subnet,
            name: item.subnet_name,
            cidr: item.subnet_cidr,
            uuid: item.subnet_uuid,
          },
          fixed_ip: item.fixed_ips?.[0]?.ip_address,
        };
      }),
    };
  }, [resource.ports, subnets]);

  const [hasCustomIp, toggleCustomIp] = useToggle(false);

  return (
    <Form<FormData>
      onSubmit={mutateAsync}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate(
              'Update internal IPs for OpenStack instance {name}',
              { name: resource.name },
            )}
            loading={isLoading}
            error={error}
            submitting={submitting}
            invalid={invalid}
          >
            {subnets ? (
              <BootstrapForm.Group>
                <div className="d-flex justify-content-between mb-5">
                  <BootstrapForm.Label className="mb-0">
                    {translate('Connected subnets')}
                  </BootstrapForm.Label>
                  <AwesomeCheckbox
                    value={hasCustomIp}
                    onChange={toggleCustomIp}
                    size="sm"
                    className="align-self-center"
                    label={translate('Custom IP configuration')}
                  />
                </div>
                <FieldArray
                  name="ports"
                  component={PortRows}
                  subnets={subnets}
                  hasCustomIp={hasCustomIp}
                />
              </BootstrapForm.Group>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
