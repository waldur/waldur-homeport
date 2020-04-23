import * as React from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { Field } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { TextField, StringField } from '@waldur/form-react';
import { renderValidationWrapper } from '@waldur/form-react/FieldValidationWrapper';
import { translate, TranslateProps } from '@waldur/i18n';
import { getUser } from '@waldur/issues/comments/selectors';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { offeringSelector } from '@waldur/marketplace/details/selectors';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import * as api from '@waldur/openstack/api';
import {
  flavorValidator,
  flavorComparator,
  internalIpFormatter,
} from '@waldur/openstack/openstack-instance/openstack-instance-config';
import {
  OpenstackInstanceNetworks,
  getDefaultFloatingIps,
} from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import { OpenstackInstanceSecurityGroups } from '@waldur/openstack/openstack-instance/OpenstackInstanceSecurityGroups';
import {
  Subnet,
  FloatingIp,
  ServiceComponent,
  Flavor,
  SshKey,
} from '@waldur/openstack/openstack-instance/types';
import {
  validateAndSort,
  calculateSystemVolumeSize,
  formatVolumeTypeChoices,
  getDefaultVolumeType,
  validateOpenstackInstanceName,
} from '@waldur/openstack/openstack-instance/utils';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { User } from '@waldur/workspace/types';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';
import { AvailabilityZone } from '../types';

import { AvailabilityZoneGroup } from './AvailabilityZoneGroup';
import { DataVolumeSizeGroup } from './DataVolumeSizeGroup';
import { DataVolumeTypeGroup } from './DataVolumeTypeGroup';
import { FlavorGroup } from './FlavorGroup';
import { ImageGroup } from './ImageGroup';
import { PublicKeyGroup } from './PublicKeyGroup';
import { SystemVolumeSizeGroup } from './SystemVolumeSizeGroup';
import { SystemVolumeTypeGroup } from './SystemVolumeTypeGroup';

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
  volumeTypes: Option[];
  isDataVolumeActive: boolean;
}

interface OpenstackInstanceCreateFormComponentProps {
  currentUser: User;
  image: ServiceComponent;
  flavor: Flavor;
  systemVolumeSize: number;
}

const nameValidators = [required, validateOpenstackInstanceName];

export class OpenstackInstanceCreateFormComponent extends React.Component<
  OfferingConfigurationFormProps &
    OpenstackInstanceCreateFormComponentProps &
    TranslateProps,
  OpenstackInstanceCreateFormState
> {
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
    volumeTypes: [],
    isDataVolumeActive: false,
  };

  async loadData() {
    const scopeUuid = this.props.offering.scope_uuid;
    try {
      this.setState({ loading: true });
      const images = await api.loadImages(scopeUuid);
      const flavors = await api.loadFlavors(scopeUuid);
      const sshKeys = await api.loadSshKeys(this.props.currentUser.uuid);
      const securityGroups = await api.loadSecurityGroups(scopeUuid);
      const subnets = await api.loadSubnets(scopeUuid);
      const floatingIps = await api.loadFloatingIps(scopeUuid);
      const availabilityZones = await api.loadInstanceAvailabilityZones(
        scopeUuid,
      );

      let volumeTypeChoices = [];
      let defaultVolumeType;

      if (isFeatureVisible('openstack.volume-types')) {
        const volumeTypes = await api.loadVolumeTypes(scopeUuid);
        volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
        defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      }
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
        volumeTypes: volumeTypeChoices,
      });
      const initial = this.props.initialAttributes;
      if (initial) {
        const flavor = flavors.find(s => s.url === initial.flavor);
        const image = images.find(s => s.url === initial.image);
        const security_groups = initial.security_groups.map(s =>
          securityGroups.find(g => g.url === s.url),
        );
        const availability_zone =
          initial.availability_zone &&
          availabilityZones.find(s => s.url === initial.availability_zone);
        const networksMap = {};
        initial.internal_ips_set.map(item => {
          networksMap[item.subnet] = 'false';
        });
        initial.floating_ips.map(item => {
          networksMap[item.subnet] = item.url || 'true';
        });
        const defaults = getDefaultFloatingIps();
        const networks = Object.keys(networksMap).map(key => {
          const subnet = subnets.find(s => s.url === key);
          const value = networksMap[key];
          const floatingIp =
            defaults.find(s => s.url === value) ||
            floatingIps.find(s => s.url === value);
          return {
            subnet: {
              ...subnet,
              label: internalIpFormatter(subnet),
            },
            floatingIp,
          };
        });
        const attributes = {
          ...initial,
          flavor,
          image,
          security_groups,
          availability_zone,
          networks,
          system_volume_type: defaultVolumeType,
          data_volume_type: defaultVolumeType,
        };
        this.props.initialize({ attributes, project: this.props.project });
      } else {
        this.props.initialize({
          attributes: {
            system_volume_type: defaultVolumeType,
            data_volume_type: defaultVolumeType,
          },
          project: this.props.project,
        });
      }
    } catch (error) {
      this.setState({ loading: false, loaded: false });
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.image !== this.props.image ||
      prevProps.flavor !== this.props.flavor
    ) {
      const formData = {
        image: this.props.image,
        flavor: this.props.flavor,
        system_volume_size: this.props.systemVolumeSize,
      };
      this.props.change(
        'attributes.system_volume_size',
        calculateSystemVolumeSize(formData),
      );
    }
  }

  updateFlavorChoices = () =>
    validateAndSort(
      { image: this.props.image },
      this.state.flavors,
      flavorValidator,
      flavorComparator,
    );

  validateFlavor = value => {
    if (
      this.props.flavor &&
      flavorValidator({ image: value }, this.props.flavor)
    ) {
      this.props.change('attributes.flavor', null);
    }
  };

  setDataVolumeActive = value => this.setState({ isDataVolumeActive: value });

  shouldComponentUpdate(prevProps) {
    if (
      prevProps.valid !== this.props.valid ||
      prevProps.invalid !== this.props.invalid
    ) {
      return false;
    }
    return true;
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {translate("Unable to get form's data.")}
        </h3>
      );
    }

    return (
      <form className="form-horizontal">
        <ProjectField />
        <CreateResourceFormGroup label={translate('VM name')} required={true}>
          <Field
            name="attributes.name"
            component={renderValidationWrapper(StringField)}
            validate={nameValidators}
          />
        </CreateResourceFormGroup>
        <ImageGroup
          images={this.state.images}
          validateFlavor={this.validateFlavor}
        />
        <FlavorGroup flavors={this.updateFlavorChoices()} />
        <AvailabilityZoneGroup
          availabilityZones={this.state.availabilityZones}
        />
        <SystemVolumeSizeGroup />
        <SystemVolumeTypeGroup volumeTypes={this.state.volumeTypes} />
        <DataVolumeSizeGroup
          isActive={this.state.isDataVolumeActive}
          setActive={this.setDataVolumeActive}
        />
        {this.state.isDataVolumeActive && (
          <DataVolumeTypeGroup volumeTypes={this.state.volumeTypes} />
        )}
        <PublicKeyGroup sshKeys={this.state.sshKeys} />
        <CreateResourceFormGroup label={translate('Security groups')}>
          <Field
            name="attributes.security_groups"
            component={fieldProps => (
              <OpenstackInstanceSecurityGroups
                securityGroups={this.state.securityGroups}
                input={fieldProps.input}
              />
            )}
          />
        </CreateResourceFormGroup>
        <CreateResourceFormGroup label={translate('Networks')}>
          <Field
            name="attributes.networks"
            component={fieldProps => (
              <OpenstackInstanceNetworks
                input={fieldProps.input}
                subnets={this.state.subnets}
                floatingIps={this.state.floatingIps}
              />
            )}
          />
        </CreateResourceFormGroup>
        <CreateResourceFormGroup label={translate('Description')}>
          <Field
            name="attributes.description"
            component={fieldProps => (
              <TextField maxLength={500} {...fieldProps.input} />
            )}
          />
        </CreateResourceFormGroup>
        <CreateResourceFormGroup label={translate('User data')}>
          <Field name="attributes.user_data" component={TextField} />
          <div className="help-block m-b-none text-muted">
            {translate(
              'Additional data that will be added to instance on provisioning.',
            )}
          </div>
        </CreateResourceFormGroup>
      </form>
    );
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
