import { PublicOfferingDetails } from 'waldur-js-client';

import { AzureSQLServerOffering } from '@/azure/sql/marketplace';
import { AzureVirtualMachineOffering } from '@/azure/vm/marketplace';
import { BookingOffering } from '@/booking/marketplace';
import { OfferingComponent } from '@/marketplace/types';
import { RemoteOffering } from '@/marketplace-remote/marketplace';
import { ScriptOffering } from '@/marketplace-script/marketplace';
import { OpenPortalOffering } from '@/openportal/marketplace';
import { OpenPortalRemoteOffering } from '@/openportal-remote/marketplace';
import { OpenStackTenantOffering } from '@/openstack/marketplace';
import { OpenStackInstanceOffering } from '@/openstack/openstack-instance/marketplace';
import { OpenStackVolumeOffering } from '@/openstack/openstack-volume/marketplace';
import { RancherOffering } from '@/rancher/cluster/create/marketplace';
import { SiteAgentOffering } from '@/site-agent/marketplace';
import { BasicOffering, SupportOffering } from '@/support/marketplace';
import { vmWareOffering } from '@/vmware/marketplace';

import { OfferingConfiguration } from './types';

const REGISTRY: { [key: string]: Omit<OfferingConfiguration, 'type'> } = {};

export interface Option {
  value: string;
  label: string;
}

function registerOfferingType(config: OfferingConfiguration) {
  const { type, ...rest } = config;
  REGISTRY[type] = rest;
}

export function getOrderFormComponent(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].orderFormComponent
  );
}

export function getDetailsComponent(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].detailsComponent
  );
}

export function getFormSerializer(offeringType: string) {
  return (
    (Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
      REGISTRY[offeringType].serializer) ||
    ((x) => x)
  );
}

export function getFormLimitSerializer(offeringType: string) {
  return (
    (Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
      REGISTRY[offeringType].limitSerializer) ||
    ((x) => x)
  );
}

export function getFormLimitParser(offeringType: string) {
  return (
    (Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
      REGISTRY[offeringType].limitParser) ||
    ((x) => x)
  );
}

export function getCheckoutSummaryComponent(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].checkoutSummaryComponent
  );
}

export function getOfferingTypes(): Option[] {
  return Object.keys(REGISTRY)
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getCreatableOfferings(): Option[] {
  const keys = Object.keys(REGISTRY).filter(
    (key) => !REGISTRY[key].disableOfferingCreation,
  );
  return keys
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function hidePlanAddButton(offeringType: string, fields: Array<any>) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].onlyOnePlan &&
    fields.length
  );
}

export function isOfferingTypeSchedulable(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].schedulable
  );
}

export function getUserManagementSection(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].userManagementSection
  );
}

export function getPluginOptionsSerializer(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].pluginOptionsSerializer
  );
}

export function getSecretOptionsSerializer(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].secretOptionsSerializer
  );
}

export function getProvisioningConfigSection(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].provisioningConfigSection
  );
}

export function getCredentialsSection(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].credentialsSection
  );
}

export function showComponentsList(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].showComponents
  );
}

export function getLabel(offeringType: string) {
  return (
    (Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
      REGISTRY[offeringType].label) ||
    offeringType
  );
}

function getOfferingComponentsFilter(offeringType: string) {
  return (
    Object.prototype.hasOwnProperty.call(REGISTRY, offeringType) &&
    REGISTRY[offeringType].offeringComponentsFilter
  );
}

export const filterOfferingComponents = (
  offering: PublicOfferingDetails,
): OfferingComponent[] => {
  let offeringComponents: OfferingComponent[] = offering.components;
  const offeringComponentsFilter = getOfferingComponentsFilter(offering.type);
  if (offeringComponentsFilter) {
    offeringComponents = offeringComponentsFilter(offering, offeringComponents);
  }
  return offeringComponents;
};

registerOfferingType(AzureSQLServerOffering);
registerOfferingType(AzureVirtualMachineOffering);
registerOfferingType(RemoteOffering);
registerOfferingType(BookingOffering);
registerOfferingType(ScriptOffering);
registerOfferingType(OpenPortalOffering);
registerOfferingType(OpenPortalRemoteOffering);
registerOfferingType(OpenStackTenantOffering);
registerOfferingType(OpenStackInstanceOffering);
registerOfferingType(OpenStackVolumeOffering);
registerOfferingType(RancherOffering);
registerOfferingType(SiteAgentOffering);
registerOfferingType(SupportOffering);
registerOfferingType(BasicOffering);
registerOfferingType(vmWareOffering);
