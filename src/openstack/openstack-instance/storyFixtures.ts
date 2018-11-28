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

export const subnets = [
  {
    url: 'http://localhost:8000/api/openstacktenant-subnets/557eaef2c2774a2da89976e59f5f09c1/',
    uuid: '557eaef2c2774a2da89976e59f5f09c1',
    name: '123-sub-net',
    cidr: '192.168.42.0/24',
    gateway_ip: '192.168.42.1',
    allocation_pools: [
        {
            start: '192.168.42.10',
            end: '192.168.42.200',
        },
    ],
    ip_version: 4,
    enable_dhcp: true,
    dns_nameservers: [],
    network: 'http://localhost:8000/api/openstacktenant-networks/8773466ef002433881cc2cd28e095026/',
  },
  {
      url: 'http://localhost:8000/api/openstacktenant-subnets/3a6d62de0ad54f5bbb9bdb5dcce11abf/',
      uuid: '3a6d62de0ad54f5bbb9bdb5dcce11abf',
      name: 'awdawd-sub-net',
      cidr: '192.168.42.0/24',
      gateway_ip: '192.168.42.1',
      allocation_pools: [
          {
              start: '192.168.42.10',
              end: '192.168.42.200',
          },
      ],
      ip_version: 4,
      enable_dhcp: true,
      dns_nameservers: [],
      network: 'http://localhost:8000/api/openstacktenant-networks/a4c80b032cc54166822b741b1d64e8b9/',
  },
  {
      url: 'http://localhost:8000/api/openstacktenant-subnets/8a07dca67f71459daab5f7f02147a367/',
      uuid: '8a07dca67f71459daab5f7f02147a367',
      name: 'baip-demo-sub-net',
      cidr: '192.168.42.0/24',
      gateway_ip: '192.168.42.1',
      allocation_pools: [
          {
              start: '192.168.42.10',
              end: '192.168.42.200',
          },
      ],
      ip_version: 4,
      enable_dhcp: true,
      dns_nameservers: [],
      network: 'http://localhost:8000/api/openstacktenant-networks/9b8fa00872fc4c0599b0c0d8ea41f473/',
  },
];

export const floatingIps = [
  {
    url: 'http://localhost:8000/api/openstacktenant-floating-ips/7892347016d74ba2872a6d6b24877319/',
    uuid: '7892347016d74ba2872a6d6b24877319',
    settings: 'http://localhost:8000/api/service-settings/0989b23135f348ae8a30f0ec32d9551c/',
    address: '185.82.124.65',
    runtime_state: 'DOWN',
    is_booked: false,
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-floating-ips/a195eaf0e3ba403bb212aeacaeb30b03/',
    uuid: 'a195eaf0e3ba403bb212aeacaeb30b03',
    settings: 'http://localhost:8000/api/service-settings/ff0e48285018422fba79c909db547dba/',
    address: '185.82.124.71',
    runtime_state: 'DOWN',
    is_booked: false,
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-floating-ips/e5a4336b2958446ca6d508fca9065961/',
    uuid: 'e5a4336b2958446ca6d508fca9065961',
    settings: 'http://localhost:8000/api/service-settings/ff0e48285018422fba79c909db547dba/',
    address: '185.82.124.84',
    runtime_state: 'DOWN',
    is_booked: false,
  },
];
