import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { getLatinNameValidators, required as valueIsRequired } from '@waldur/core/validators';
import { NumberField, TextField, StringField } from '@waldur/form-react';
import { renderValidationWrapper } from '@waldur/form-react/FieldValidationWrapper';
import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { translate, TranslateProps } from '@waldur/i18n';
import { getUser } from '@waldur/issues/comments/selectors';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { offeringSelector } from '@waldur/marketplace/details/selectors';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import * as api from '@waldur/openstack/api';
import { flavorValidator, flavorComparator } from '@waldur/openstack/openstack-instance/openstack-instance-config';
import { OpenstackInstanceDataVolume } from '@waldur/openstack/openstack-instance/OpenstackInstanceDataVolume';
import { OpenstackInstanceNetworks } from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import { OpenstackInstanceSecurityGroups } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
import { Subnet, FloatingIp, ServiceComponent, Flavor, SshKey } from '@waldur/openstack/openstack-instance/types';
import { validateAndSort, calculateSystemVolumeSize } from '@waldur/openstack/openstack-instance/utils';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { User } from '@waldur/workspace/types';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';
import { AvailabilityZone } from '../types';

interface OpenstackInstanceCreateFormState {
  loading: boolean;
  loaded: boolean;
  securityGroups: SecurityGroup[];
  subnets: Subnet[];
  floatingIps: FloatingIp[];
  images: ServiceComponent[];
  flavors: Flavor[];
  sshKeys: SshKey[];
  availabilityZones: AvailabilityZone[];
}

interface OpenstackInstanceCreateFormComponentProps {
  currentUser: User;
  image: ServiceComponent;
  flavor: Flavor;
  systemVolumeSize: number;
}

export class OpenstackInstanceCreateFormComponent extends
  React.Component<OfferingConfigurationFormProps & OpenstackInstanceCreateFormComponentProps & TranslateProps, OpenstackInstanceCreateFormState> {
  state = {
    loading: false,
    loaded: false,
    securityGroups: [],
    subnets: [],
    floatingIps: [],
    images: [],
    flavors: [],
    sshKeys: [],
    availabilityZones: [],
  };

  async loadData() {
    const scopeUuid = this.props.offering.scope_uuid;
    try {
      this.setState({loading: true});
      const images = await api.loadImages(scopeUuid);
      const flavors = await api.loadFlavors(scopeUuid);
      const sshKeys = await api.loadSshKeys(this.props.currentUser.uuid);
      const securityGroups = await api.loadSecurityGroups(scopeUuid);
      const subnets = await api.loadSubnets(scopeUuid);
      const floatingIps = await api.loadFloatingIps(scopeUuid);
      const availabilityZones = await api.loadInstanceAvailabilityZones(scopeUuid);
      this.setState({
        loading: false,
        loaded: true,
        securityGroups,
        subnets,
        floatingIps,
        images,
        flavors,
        sshKeys,
        availabilityZones,
      });
    } catch (error) {
      this.setState({loading: false, loaded: false});
    }
  }

  componentDidMount() {
    this.loadData();
    if (this.props.initialAttributes) {
      this.props.initialize({
        attributes: {
          ...this.props.initialAttributes,
          networks:  this.formatNetworks(this.props.initialAttributes),
        }});
      }
  }

  formatNetworks(initialAttributes) {
    const networks = [];
    for (let i = 0; i < initialAttributes.subnets.length; i++) {
      networks.push({
        subnet: initialAttributes.subnets[i],
        floatingIp: initialAttributes.floating_ips[i],
      });
    }
    return networks;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.image !== this.props.image || prevProps.flavor !== this.props.flavor) {
      const formData = {
        image: this.props.image,
        flavor: this.props.flavor,
        system_volume_size: this.props.systemVolumeSize,
      };
      this.props.change('attributes.system_volume_size', calculateSystemVolumeSize(formData));
    }
  }

  updateFlavorChoices = () =>
    validateAndSort({image: this.props.image}, this.state.flavors, flavorValidator, flavorComparator)

  validateFlavor = value => {
    if (this.props.flavor && flavorValidator({image: value}, this.props.flavor)) {
      this.props.change('attributes.flavor', null);
    }
  }

  shouldComponentUpdate(prevProps) {
    if (prevProps.valid !== this.props.valid || prevProps.invalid !== this.props.invalid) {
      return false;
    }
    return true;
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loading && !this.state.loaded) {
      return (
        <h3 className="text-center">
          {translate('Unable to get form\'s data.')}
        </h3>
      );
    }

    if (this.state.loaded) {
      return (
        <form className="form-horizontal">
          <ProjectField/>
          <CreateResourceFormGroup
            label={translate('VM name')}
            required={true}
          >
            <Field
              name="attributes.name"
              component={renderValidationWrapper(StringField)}
              validate={getLatinNameValidators()}
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup
            label={translate('Image')}
            required={true}
          >
            <Field
              name="attributes.image"
              validate={valueIsRequired}
              component={renderValidationWrapper(
                fieldProps =>
                  <SelectDialogField
                    id="image"
                    columns={[
                      {
                        label: translate('Image name'),
                        name: 'name',
                      },
                      {
                        label: (
                          <>
                            {translate('Min RAM')}
                            {' '}
                            <PriceTooltip/>
                          </>
                        ),
                        name: 'min_ram',
                        filter: formatFilesize,
                      },
                      {
                        label: translate('Min storage'),
                        name: 'min_disk',
                        filter: formatFilesize,
                      },
                    ]}
                    choices={this.state.images}
                    input={{
                      name: fieldProps.input.name,
                      value: fieldProps.input.value,
                      onChange: value => {
                        fieldProps.input.onChange(value);
                        this.validateFlavor(value);
                      },
                    }}
                  />
                )
              }
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup
            label={translate('Flavor')}
            required={true}
          >
            <Field
              name="attributes.flavor"
              component={fieldProps =>
                <SelectDialogField
                  id="flavor"
                  columns={[
                    {
                      label: translate('Flavor name'),
                      name: 'name',
                    },
                    {
                      label: 'vCPU',
                      name: 'cores',
                    },
                    {
                      label: 'RAM',
                      name: 'ram',
                      filter: formatFilesize,
                    },
                    {
                      label: translate('Storage'),
                      name: 'disk',
                      filter: formatFilesize,
                    },
                  ]}
                  choices={this.updateFlavorChoices()}
                  input={fieldProps.input}
                />
              }
            />
          </CreateResourceFormGroup>
          {this.state.availabilityZones.length > 0 && (
            <CreateResourceFormGroup label={translate('Availability zone')}>
              <Field
                name="attributes.availability_zone"
                component={fieldProps => (
                  <Select
                    value={fieldProps.input.value}
                    onChange={fieldProps.input.onChange}
                    options={this.state.availabilityZones}
                    labelKey="name"
                    valueKey="url"
                    simpleValue={true}
                  />
                )}
              />
            </CreateResourceFormGroup>
          )}
          <CreateResourceFormGroup
            label={translate('System volume size')}
            required={true}
          >
            <Field
              name="attributes.system_volume_size"
              validate={valueIsRequired}
              component={renderValidationWrapper(
                fieldProps =>
                  <>
                    <div className="input-group" style={{maxWidth: 200}}>
                      <NumberField
                        min={1}
                        max={1 * 4096}
                        {...fieldProps.input}/>
                      <span className="input-group-addon">GB</span>
                    </div>
                  </>
                )
              }
              format={v => v ? v / 1024 : ''}
              normalize={v => Number(v) * 1024}
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup>
            <Field
              name="attributes.data_volume_size"
              component={fieldProps =>
                <OpenstackInstanceDataVolume
                  field={{
                    input: fieldProps.input,
                    min: 1,
                    max: 1 * 4096,
                  }}
                  units="GB"
                />
              }
              format={v => v ? v / 1024 : ''}
              normalize={v => Number(v) * 1024}
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup label={translate('SSH public key')}>
            <Field
              name="attributes.ssh_public_key"
              component={fieldProps =>
                <SelectDialogField
                  columns={[
                    {
                      label: translate('Name'),
                      name: 'name',
                    },
                    {
                      label: translate('Fingerprint'),
                      name: 'fingerprint',
                    },
                  ]}
                  choices={this.state.sshKeys}
                  input={fieldProps.input}
                  preSelectFirst={true}
                  emptyMessage={
                  <>
                    {translate(`You have not added any SSH keys to your`)}
                    {' '}
                    <Link state="profile.keys">{translate('profile.')}</Link>
                  </>
                  }
                />
              }
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup label={translate('Security groups')}>
            <Field
              name="attributes.security_groups"
              component={fieldProps =>
                <OpenstackInstanceSecurityGroups
                  securityGroups={this.state.securityGroups}
                  input={fieldProps.input}
                />
              }
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup label={translate('Networks')}>
            <Field
              name="attributes.networks"
              component={fieldProps =>
                <OpenstackInstanceNetworks
                  input={fieldProps.input}
                  subnets={this.state.subnets}
                  floatingIps={this.state.floatingIps}
                />
              }
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup label={translate('Description')}>
            <Field
              name="attributes.description"
              component={fieldProps =>
                <TextField
                  maxLength={500}
                  {...fieldProps.input}
                />
              }
            />
          </CreateResourceFormGroup>
          <CreateResourceFormGroup label={translate('User data')}>
            <Field
              name="attributes.user_data"
              component={TextField}
            />
            <div className="help-block m-b-none text-muted">
              {translate('Additional data that will be added to instance on provisioning.')}
            </div>
          </CreateResourceFormGroup>
        </form>
      );
    }
  }
}

const mapStateToProps = state => ({
  currentUser: getUser(state),
  image: offeringSelector(state, 'attributes.image'),
  flavor: offeringSelector(state, 'attributes.flavor'),
  systemVolumeSize: offeringSelector(state, 'attributes.system_volume_size'),
});

export const OpenstackInstanceCreateForm = connect<
  OpenstackInstanceCreateFormComponentProps,
  {},
  OfferingConfigurationFormProps
>(mapStateToProps)(OpenstackInstanceCreateFormComponent);
