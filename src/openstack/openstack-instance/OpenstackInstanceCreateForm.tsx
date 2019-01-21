import * as React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { getLatinNameValidators } from '@waldur/core/validators';
import { StringField, NumberField, TextField } from '@waldur/form-react';
import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { translate, TranslateProps } from '@waldur/i18n';
import { getUser } from '@waldur/issues/comments/selectors';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import * as api from '@waldur/openstack/api';
import { flavorValidator, flavorComparator } from '@waldur/openstack/openstack-instance/openstack-instance-config';
import { OpenstackInstanceDataVolume } from '@waldur/openstack/openstack-instance/OpenstackInstanceDataVolume';
import { OpenstackInstanceNetworks } from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import { OpenstackInstanceSecurityGroups } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
import { openstackInstanceCreateFormSelector } from '@waldur/openstack/openstack-instance/store/selectors';
import { Subnet, FloatingIp, ServiceComponent, Flavor, SshKey } from '@waldur/openstack/openstack-instance/types';
import { validateAndSort, calculateSystemVolumeSize } from '@waldur/openstack/openstack-instance/utils';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { User } from '@waldur/workspace/types';

interface OpenstackInstanceFormGroupProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const OpenstackInstanceFormGroup = ({label, required, children}: OpenstackInstanceFormGroupProps) => (
  <>
  {label ? (
    <FormGroup
      labelClassName="control-label col-sm-3"
      valueClassName="col-sm-9"
      label={label}
      required={required}>
      {children}
    </FormGroup>
  ) : (
    <FormGroup
      classNameWithoutLabel="col-sm-offset-3 col-sm-9"
      required={required}>
      {children}
    </FormGroup>
  )}
  </>
);

interface OpenstackInstanceCreateFormState {
  loading: boolean;
  loaded: boolean;
  securityGroups: SecurityGroup[];
  subnets: Subnet[];
  floatingIps: FloatingIp[];
  images: ServiceComponent[];
  flavors: Flavor[];
  sshKeys: SshKey[];
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
      this.setState({
        loading: false,
        loaded: true,
        securityGroups,
        subnets,
        floatingIps,
        images,
        flavors,
        sshKeys,
      });
    } catch (error) {
      this.setState({loading: false, loaded: false});
    }
  }

  componentDidMount() {
    this.loadData();
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
          <OpenstackInstanceFormGroup
            label={translate('VM name')}
            required={true}
          >
            <Field
              name="attributes.name"
              component={StringField}
              validate={getLatinNameValidators()}
            />
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup
            label={translate('Image')}
            required={true}
          >
            <Field
              name="attributes.image"
              component={fieldProps =>
                <SelectDialogField
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
              }
            />
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup
            label={translate('Flavor')}
            required={true}
          >
            <Field
              name="attributes.flavor"
              component={fieldProps =>
                <SelectDialogField
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
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup
            label={translate('System volume size')}
            required={true}
          >
            <div className="input-group" style={{maxWidth: 200}}>
              <Field
                name="attributes.system_volume_size"
                component={fieldProps =>
                  <NumberField
                    min={1}
                    max={1 * 4096}
                    {...fieldProps.input}/>
                }
                format={v => v ? v / 1024 : ''}
                normalize={v => Number(v) * 1024}
              />
              <span className="input-group-addon">
                GB
              </span>
            </div>
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup>
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
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup label={translate('SSH public key')}>
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
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup label={translate('Security groups')}>
            <Field
              name="attributes.security_groups"
              component={fieldProps =>
                <OpenstackInstanceSecurityGroups
                  securityGroups={this.state.securityGroups}
                  input={fieldProps.input}
                />
              }
            />
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup label={translate('Networks')}>
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
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup label={translate('Description')}>
            <Field
              name="attributes.description"
              component={fieldProps =>
                <TextField
                  maxLength={500}
                  {...fieldProps.input}
                />
              }
            />
          </OpenstackInstanceFormGroup>
          <OpenstackInstanceFormGroup label={translate('User data')}>
            <Field
              name="attributes.user_data"
              component={TextField}
            />
            <div className="help-block m-b-none text-muted">
              {translate('Additional data that will be added to instance on provisioning.')}
            </div>
          </OpenstackInstanceFormGroup>
        </form>
      );
    }
  }
}

const mapStateToProps = state => ({
  currentUser: getUser(state),
  image: openstackInstanceCreateFormSelector(state, 'attributes.image'),
  flavor: openstackInstanceCreateFormSelector(state, 'attributes.flavor'),
  systemVolumeSize: openstackInstanceCreateFormSelector(state, 'attributes.system_volume_size'),
});

export const OpenstackInstanceCreateForm = connect<
  OpenstackInstanceCreateFormComponentProps,
  {},
  OfferingConfigurationFormProps
>(mapStateToProps)(OpenstackInstanceCreateFormComponent);
