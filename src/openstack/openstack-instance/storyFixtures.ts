export const quotas = [
  {
    name: 'vcpu',
    usage: 2,
    limit: 80,
    limitType: 'QUOTA_PACKAGE_TYPE',
    required: 2,
  },
  {
    name: 'ram',
    usage: 2024,
    limit: 4096,
    limitType: 'QUOTA_PACKAGE_TYPE',
    required: 4066,
  },
  {
    name: 'storage',
    usage: 10240,
    limit: 512000,
    limitType: 'QUOTA_PACKAGE_TYPE',
    required: 11264,
  },
  {
    name: 'cost',
    usage: 1328.58,
    limit: -1,
    required: 4.608043182,
  },
];
