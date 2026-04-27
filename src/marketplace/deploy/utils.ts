import { createElement } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import CentOS from '@/images/appstore/centos.svg';
import Debian from '@/images/appstore/debian.svg';
import FreeBSD from '@/images/appstore/freebsd-1.svg';
import Oracle from '@/images/appstore/oracle.svg';
import Rocky from '@/images/appstore/rocky.svg';
import Ubuntu from '@/images/appstore/ubuntu.svg';
import Windows from '@/images/appstore/windows.svg';

import { BoxRadioChoice } from './steps/BoxRadioField';
import { OfferingConfigurationFormStep } from './types';

export const SYSTEM_IMAGES = [
  // Major Linux distributions
  { name: 'ubuntu', label: 'Ubuntu', thumb: Ubuntu },
  { name: 'debian', label: 'Debian', thumb: Debian },
  { name: 'centos', label: 'CentOS', thumb: CentOS },
  { name: 'almalinux', label: 'AlmaLinux', thumb: null },
  { name: 'rockylinux', label: 'RockyLinux', thumb: Rocky },
  { name: 'rocky', label: 'Rocky', thumb: Rocky },
  { name: 'fedora', label: 'Fedora', thumb: null },
  { name: 'red hat', label: 'Red Hat', thumb: null },
  { name: 'rhel', label: 'RHEL', thumb: null },
  { name: 'opensuse', label: 'openSUSE', thumb: null },
  { name: 'suse', label: 'SUSE', thumb: null },
  { name: 'sles', label: 'SLES', thumb: null },
  { name: 'alpine', label: 'Alpine', thumb: null },
  { name: 'arch linux', label: 'Arch Linux', thumb: null },
  { name: 'kali', label: 'Kali', thumb: null },
  // Windows
  { name: 'windows server', label: 'Windows Server', thumb: Windows },
  { name: 'windows', label: 'Windows', thumb: Windows },
  // Other OS
  { name: 'oracle', label: 'Oracle', thumb: Oracle },
  { name: 'freebsd', label: 'FreeBSD', thumb: FreeBSD },
  { name: 'netbsd', label: 'NetBSD', thumb: null },
  { name: 'openbsd', label: 'OpenBSD', thumb: null },
  { name: 'dragonflybsd', label: 'DragonFlyBSD', thumb: null },
  // Network appliances
  { name: 'mikrotik', label: 'Mikrotik', thumb: null },
  { name: 'sophos', label: 'Sophos', thumb: null },
  { name: 'vyos', label: 'VyOS', thumb: null },
  { name: 'pfsense', label: 'pfSense', thumb: null },
  { name: 'opnsense', label: 'OPNsense', thumb: null },
  // Fortinet products
  { name: 'fortinet', label: 'Fortinet', thumb: null },
  { name: 'fortigate', label: 'FortiGate', thumb: null },
  { name: 'fortimanager', label: 'FortiManager', thumb: null },
  { name: 'fortianalyzer', label: 'FortiAnalyzer', thumb: null },
  { name: 'fortiauthenticator', label: 'FortiAuthenticator', thumb: null },
  // Test images
  { name: 'cirros', label: 'CirrOS', thumb: null },
];

const findImage = (name) =>
  SYSTEM_IMAGES.find((item) => name.toLowerCase().includes(item.name));

export const generateSystemImageChoices = (data: any[]) => {
  if (!data?.length) return [];
  const _choices = data.reduce<BoxRadioChoice[]>((acc, value) => {
    const image = findImage(value.name);
    if (image) {
      const version = value.name
        .replace(new RegExp(`.*${image.name}[\\s\\-_]*`, 'gi'), '')
        .trim();

      const prevChoice = acc.find((choice) => choice.value === image.name);
      if (prevChoice) {
        prevChoice.options.push({ label: version, value });
      } else {
        const choice = {
          label: image.label,
          value: image.name,
          image: image.thumb ? createElement(image.thumb) : undefined,
          options: [{ label: version, value }],
        };
        acc.push(choice);
      }
    } else {
      // Split name into base name and version at the first digit boundary
      // e.g. "AlmaLinux 8 x86_64" → label: "AlmaLinux", version: "8 x86_64"
      // e.g. "vyos-1.4.3-openstack" → label: "vyos", version: "1.4.3-openstack"
      // e.g. "Mikrotik v6-LTS" → label: "Mikrotik", version: "v6-LTS"
      const versionMatch = value.name.match(/^(.*?)[\s\-_]+(v?\d.*)$/i);
      let label: string;
      let version: string;
      if (versionMatch) {
        label = versionMatch[1].trim();
        version = versionMatch[2].trim();
      } else {
        label = value.name.trim();
        version = '';
      }
      const prevChoice = acc.find((choice) => choice.value === label);
      if (prevChoice) {
        prevChoice.options.push({ label: version || label, value });
      } else {
        const choice = {
          label,
          value: label,
          options: [{ label: version || label, value }],
        };
        acc.push(choice);
      }
    }
    return acc;
  }, []);
  _choices.forEach((choice) => {
    choice.options.sort((a, b) => b.label - a.label);
  });
  return _choices;
};

export const hasStepWithField = (
  steps: OfferingConfigurationFormStep[],
  field: string,
) =>
  steps &&
  steps.some((step) => step.fields && step.fields.some((key) => key === field));

export const concealPricesSelector = () =>
  isFeatureVisible(MarketplaceFeatures.conceal_prices);
