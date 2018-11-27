export const securityGroups = [
  {
    url: 'http://localhost:8000/api/openstacktenant-security-groups/760766b5139b44ada2cb8b4763eae83a/',
    uuid: '760766b5139b44ada2cb8b4763eae83a',
    name: 'default',
    settings: 'http://localhost:8000/api/service-settings/6ef6583cf1ac48648c7af9dea37bfdbe/',
    description: 'Default security group',
    rules: [
      {
        to_port: -1,
        cidr: '0.0.0.0/0',
        from_port: -1,
        protocol: '',
      },
      {
        to_port: -1,
        cidr: '0.0.0.0/0',
        from_port: -1,
        protocol: '',
      },
    ],
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-security-groups/24faa830e6ba49248c9ba7fe3e47569d/',
    uuid: '24faa830e6ba49248c9ba7fe3e47569d',
    name: 'http',
    settings: 'http://localhost:8000/api/service-settings/6ef6583cf1ac48648c7af9dea37bfdbe/',
    description: 'Security group for HTTP',
    rules: [
      {
        to_port: 80,
        cidr: '0.0.0.0/0',
        from_port: 80,
        protocol: 'tcp',
      },
    ],
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-security-groups/e8177d40ae374670bb4181bd435924f9/',
    uuid: 'e8177d40ae374670bb4181bd435924f9',
    name: 'https',
    settings: 'http://localhost:8000/api/service-settings/6ef6583cf1ac48648c7af9dea37bfdbe/',
    description: 'Security group for HTTPS',
    rules: [
      {
        to_port: 443,
        cidr: '0.0.0.0/0',
        from_port: 443,
        protocol: 'tcp',
      },
    ],
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-security-groups/d6646ca7b33a4ab594345880c46acf5c/',
    uuid: 'd6646ca7b33a4ab594345880c46acf5c',
    name: 'icmp',
    settings: 'http://localhost:8000/api/service-settings/6ef6583cf1ac48648c7af9dea37bfdbe/',
    description: 'Security group for ICMP',
    rules: [
      {
        to_port: -1,
        cidr: '0.0.0.0/0',
        from_port: -1,
        protocol: 'icmp',
      },
    ],
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-security-groups/70595eba75324cdfb762e87953c20785/',
    uuid: '70595eba75324cdfb762e87953c20785',
    name: 'postgresql',
    settings: 'http://localhost:8000/api/service-settings/6ef6583cf1ac48648c7af9dea37bfdbe/',
    description: 'Security group for PostgreSQL PaaS service',
    rules: [
      {
        to_port: 5432,
        cidr: '0.0.0.0/0',
        from_port: 5432,
        protocol: 'tcp',
      },
      {
        to_port: 22,
        cidr: '0.0.0.0/0',
        from_port: 22,
        protocol: 'tcp',
      },
      {
        to_port: -1,
        cidr: '0.0.0.0/0',
        from_port: -1,
        protocol: 'icmp',
      },
    ],
  },
];
