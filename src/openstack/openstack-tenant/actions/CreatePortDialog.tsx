import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from 'react-use';
import { Field, formValueSelector } from 'redux-form';
import { openstackPortsCreate, OpenStackSubNet } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { isMatchPattern, required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadNetworks, loadSubnets } from '@waldur/openstack/api';
import {
  CustomIpField,
  SubnetValueContainer,
} from '@waldur/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

const MAC_ADDRESS_PATTERN = new RegExp(
  '^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$',
  'gm',
);

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const networkSelector = (state: RootState) => selector(state, 'network');
const fixedIpsSelector = (state: RootState) => selector(state, 'fixed_ips');

const macAddressValidator = (value) =>
  isMatchPattern(
    MAC_ADDRESS_PATTERN,
    translate('Please enter a valid mac address'),
  )(value);

export const FixedIPsField: FC<{
  subnets: OpenStackSubNet[];
  customIp?: boolean;
  change;
}> = ({ subnets, customIp = false, change }) => {
  const [customIpEnabled, setCustomIpEnabled] = useToggle(customIp);
  const fixedIps = useSelector(fixedIpsSelector);

  const toggleCustomIp = (value) => {
    setCustomIpEnabled(value);
    if (!value) {
      change('fixed_ips.fixed_ip', undefined);
    }
  };

  return (
    <Form.Group>
      <div className="d-flex justify-content-between mb-5">
        <Form.Label className="mb-0">{translate('Fixed IPs')}</Form.Label>
        <AwesomeCheckbox
          value={customIpEnabled}
          onChange={toggleCustomIp}
          size="sm"
          className="align-self-center"
          label={translate('Custom IP configuration')}
        />
      </div>
      <div className="border-rows mb-4">
        <Row className="g-4">
          <Col xs={12}>
            <Field
              name="fixed_ips.subnet"
              label={translate('Subnet')}
              component={FormGroup}
              options={subnets}
              placeholder={translate('Select subnet')}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              noUpdateOnBlur
              spaceless
              components={{ ValueContainer: SubnetValueContainer }}
            >
              <SelectField />
            </Field>
          </Col>
          {customIpEnabled && fixedIps && (
            <Col xs={12}>
              <CustomIpField parentName="fixed_ips" data={fixedIps} autoFocus />
            </Col>
          )}
        </Row>
      </div>
    </Form.Group>
  );
};

export const CreatePortDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  const network = useSelector(networkSelector);

  const {
    data: networks,
    error: errorNetworks,
    isLoading: isLoadingNetworks,
    refetch: refetchNetworks,
  } = useQuery({
    queryKey: ['port-form-networks', resource.uuid],

    queryFn: () =>
      loadNetworks({
        tenant_uuid: resource.uuid,
        field: ['name', 'uuid', 'url'],
      }),

    staleTime: 60 * 1000,
  });

  const { data: subnets } = useQuery({
    queryKey: ['port-form-subnets', resource.uuid, network],

    queryFn: () => {
      if (!network) return Promise.resolve([]);
      const networkObj = networks.find((net) => net.url === network);
      return loadSubnets({
        tenant_uuid: resource.uuid,
        network_uuid: networkObj.uuid,
      });
    },

    staleTime: 60 * 1000,
  });

  const networkOptions = useMemo(
    () =>
      networks?.length
        ? networks.map((network) => ({
            label: network.name,
            value: network.url,
          }))
        : [],
    [networks],
  );

  const submitForm = useCallback(
    async (formData) => {
      let fixed_ips;
      if (formData.fixed_ips) {
        fixed_ips = [
          {
            subnet_id: formData.fixed_ips.subnet.backend_id,
            ip_address: formData.fixed_ips?.fixed_ip,
          },
        ];
      }

      const body = {
        ...formData,
        fixed_ips,
        port_security_enabled: formData.port_security_enabled || false,
      };

      try {
        await openstackPortsCreate({ body });
        dispatch(
          showSuccess(translate('OpenStack network port has been created.')),
        );
        dispatch(closeModalDialog());
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to create OpenStack network port.'),
          ),
        );
      }
    },
    [dispatch, refetch],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create port for OpenStack network')}
      loading={isLoadingNetworks}
      error={errorNetworks}
      refetch={refetchNetworks}
      submitForm={submitForm}
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'network',
          label: translate('Network'),
          type: 'select',
          options: networkOptions,
          validate: [required],
          required: true,
        },
        {
          name: 'fixed_ips',
          component: FixedIPsField,
          extraProps: { subnets },
        },
        {
          name: 'mac_address',
          label: translate('MAC address'),
          type: 'string',
          validate: [macAddressValidator],
        },
        {
          name: 'port_security_enabled',
          label: translate('Port security enabled'),
          type: 'boolean',
        },
      ]}
    />
  );
};
