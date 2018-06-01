import { ListCell } from './ListCell';

export const sections = [
  {
    title: 'Summary',
    features: [
      {
        key: 'pricingOption',
        title: 'Pricing options',
      },
      {
        key: 'installs',
        title: 'Installation count',
      },
      {
        key: 'cloudDeploymentModel',
        title: 'Cloud deployment model',
      },
      {
        key: 'vendorType',
        title: 'Supplier type',
      },
    ],
  },
  {
    title: 'Access and support',
    features: [
      {
        key: 'userSupportOptions',
        title: 'User support',
        render: ListCell,
      },
      {
        key: 'interfaceOptions',
        title: 'Using the service',
        render: ListCell,
      },
      {
        key: 'metricsReporting',
        title: 'Metrics reporting',
        render: ListCell,
      },
    ],
  },
  {
    title: 'Security',
    features: [
      {
        key: 'dataProtectionExternal',
        title: 'Data protection between buyer and supplier networks',
      },
      {
        key: 'dataProtectionInternal',
        title: 'Data protection within supplier network',
      },
      {
        key: 'userAuth',
        title: 'User authentication',
      },
      {
        key: 'managementAuth',
        title: 'Management access authentication',
      },
      {
        key: 'securityCertifications',
        title: 'Security certification',
      },
    ],
  },
];
