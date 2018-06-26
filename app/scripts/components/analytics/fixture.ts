export const quotas = {
  registeredLimited: {
    url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'ram',
    label: 'RAM',
    limit: 5000,
    usage: 26033,
  },
  registeredUnlimited: {
    url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'snapshots',
    label: 'Snapshots',
    limit: -1,
    usage: 26033,
  },
  uregistered: {
    url: 'https://example.com/api/quotas/8c8293ce6ad745098ce79eeb48eadc66/',
    uuid: '8c8293ce6ad745098ce79eeb48eadc66',
    name: 'freeipa_quota',
    label: 'noname',
    limit: 10000,
    usage: 0,
  },
  exceeds: {
    url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'snapshots',
    label: 'Snapshots',
    limit: 26033,
    usage: 26033,
  },
  quotasArr: {
    unfiltered: [
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'ram',
        limit: 5000,
        usage: 26033,
      },
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'snapshots',
        limit: -1,
        usage: 26033,
      },
      {
        url: 'https://example.com/api/quotas/8c8293ce6ad745098ce79eeb48eadc66/',
        uuid: '8c8293ce6ad745098ce79eeb48eadc66',
        name: 'freeipa_quota',
        limit: 10000,
        usage: 0,
      },
    ],
    registryFiltered: [
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'ram',
        limit: 5000,
        usage: 26033,
      },
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'snapshots',
        limit: -1,
        usage: 26033,
      },
    ],
    labeled: [
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'ram',
        label: 'RAM',
        limit: 5000,
        usage: 26033,
      },
      {
        url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
        uuid: '049fab371f2844e79d2997eadfbb4cd6',
        name: 'snapshots',
        label: 'Snapshots',
        limit: -1,
        usage: 26033,
      },
      {
        url: 'https://example.com/api/quotas/8c8293ce6ad745098ce79eeb48eadc66/',
        uuid: '8c8293ce6ad745098ce79eeb48eadc66',
        name: 'freeipa_quota',
        label: '',
        limit: 10000,
        usage: 0,
      },
    ],
    quotasBeforeCombine: [
      [
        {
          limit: 10240,
          name: 'ram',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
          usage: 0,
          uuid: '082c6fd918f0432296f00fab0cc30234',
        },
        {
          limit: -1,
          name: 'volumes_size',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/71063588da8644f38a337e7aa3928d68/',
          usage: 0,
          uuid: '71063588da8644f38a337e7aa3928d68',
        },
        {
          limit: 10,
          name: 'subnet_count',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/8f9cd20e0ca140c9afa5008476e39929/',
          usage: 1,
          uuid: '8f9cd20e0ca140c9afa5008476e39929',
        },
      ],
      [
        {
          limit: 10240,
          name: 'ram',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/ed561cdf1656432494761e457049f337/',
          usage: 2048,
          uuid: 'ed561cdf1656432494761e457049f337',
        },
        {
          limit: -1,
          name: 'volumes_size',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/d2b69649ef1b4b17b3523fd1b826c293/',
          usage: 33792,
          uuid: 'd2b69649ef1b4b17b3523fd1b826c293',
        },
        {
          limit: 10,
          name: 'subnet_count',
          scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
          threshold: 0,
          url: 'https://rest-test.nodeconductor.com/api/quotas/06f9f5ca733842c19a94bff1ba6402fc/',
          usage: 1,
          uuid: '06f9f5ca733842c19a94bff1ba6402fc',
        },
      ],
    ],
    quotasAfterCombine: [
      {
        limit: 20480,
        name: 'ram',
        scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
        threshold: 0,
        url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
        usage: 2048,
        uuid: [
          '082c6fd918f0432296f00fab0cc30234',
          'ed561cdf1656432494761e457049f337',
        ],
      },
      {
        limit: -1,
        name: 'volumes_size',
        scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
        threshold: 0,
        url: 'https://rest-test.nodeconductor.com/api/quotas/71063588da8644f38a337e7aa3928d68/',
        usage: 33792,
        uuid: [
          '71063588da8644f38a337e7aa3928d68',
          'd2b69649ef1b4b17b3523fd1b826c293',
        ],
      },
      {
        limit: 20,
        name: 'subnet_count',
        scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
        threshold: 0,
        url: 'https://rest-test.nodeconductor.com/api/quotas/8f9cd20e0ca140c9afa5008476e39929/',
        usage: 2,
        uuid: [
          '8f9cd20e0ca140c9afa5008476e39929',
          '06f9f5ca733842c19a94bff1ba6402fc',
        ],
      },
    ],
    historyQuotasBeforeCombine: [
      [
        {
          data: [
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
                usage: 0,
                uuid: '082c6fd918f0432296f00fab0cc30234',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
                usage: 0,
                uuid: '082c6fd918f0432296f00fab0cc30234',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
                usage: 0,
                uuid: '082c6fd918f0432296f00fab0cc30234',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'ram',
          uuid: '082c6fd918f0432296f00fab0cc30234',
        },
        {
          data: [
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
                usage: 0,
                uuid: 'fcd04f77023a43be931749434cf7b777',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
                usage: 0,
                uuid: 'fcd04f77023a43be931749434cf7b777',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
                usage: 0,
                uuid: 'fcd04f77023a43be931749434cf7b777',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'snapshots',
          uuid: 'fcd04f77023a43be931749434cf7b777',
        },
        {
          data: [
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
                usage: 0,
                uuid: '5adbf62179a143e4b4ed29d796976ff1',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
                usage: 0,
                uuid: '5adbf62179a143e4b4ed29d796976ff1',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
                usage: 0,
                uuid: '5adbf62179a143e4b4ed29d796976ff1',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'volumes',
          uuid: '5adbf62179a143e4b4ed29d796976ff1',
        },
      ],
      [
        {
          data: [
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/ed561cdf1656432494761e457049f337/',
                usage: 2048,
                uuid: 'ed561cdf1656432494761e457049f337',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/ed561cdf1656432494761e457049f337/',
                usage: 2048,
                uuid: 'ed561cdf1656432494761e457049f337',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 10240,
                name: 'ram',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/ed561cdf1656432494761e457049f337/',
                usage: 2048,
                uuid: 'ed561cdf1656432494761e457049f337',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'ram',
          uuid: 'ed561cdf1656432494761e457049f337',
        },
        {
          data: [
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/9d3bece47e3745f0b6320e49dbe92443/',
                usage: 0,
                uuid: '9d3bece47e3745f0b6320e49dbe92443',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/9d3bece47e3745f0b6320e49dbe92443/',
                usage: 0,
                uuid: '9d3bece47e3745f0b6320e49dbe92443',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 50,
                name: 'snapshots',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/9d3bece47e3745f0b6320e49dbe92443/',
                usage: 0,
                uuid: '9d3bece47e3745f0b6320e49dbe92443',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'snapshots',
          uuid: '9d3bece47e3745f0b6320e49dbe92443',
        },
        {
          data: [
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/26b963516cf04a69ab7a45a2972787d0/',
                usage: 6,
                uuid: '26b963516cf04a69ab7a45a2972787d0',
              },
              point: 1527258000,
            },
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/26b963516cf04a69ab7a45a2972787d0/',
                usage: 6,
                uuid: '26b963516cf04a69ab7a45a2972787d0',
              },
              point: 1527443142,
            },
            {
              object: {
                limit: 50,
                name: 'volumes',
                scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/cf1cb0536e96465ab817a0098772fe43/',
                threshold: 0,
                url: 'https://rest-test.nodeconductor.com/api/quotas/26b963516cf04a69ab7a45a2972787d0/',
                usage: 6,
                uuid: '26b963516cf04a69ab7a45a2972787d0',
              },
              point: 1527628285,
            },
          ],
          loading: false,
          name: 'volumes',
          uuid: '26b963516cf04a69ab7a45a2972787d0',
        },
      ],
    ],
    historyQuotasAfterCombine: [
      {
        data: [
          {
            object: {
              limit: 20480,
              name: 'ram',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              usage: 2048,
              uuid: '082c6fd918f0432296f00fab0cc30234',
            },
            point: 1527258000,
          },
          {
            object: {
              limit: 20480,
              name: 'ram',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              usage: 2048,
              uuid: '082c6fd918f0432296f00fab0cc30234',
            },
            point: 1527443142,
          },
          {
            object: {
              limit: 20480,
              name: 'ram',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              usage: 2048,
              uuid: '082c6fd918f0432296f00fab0cc30234',
            },
            point: 1527628285,
          },
        ],
        loading: false,
        name: 'ram',
        uuid: [
          '082c6fd918f0432296f00fab0cc30234',
          'ed561cdf1656432494761e457049f337',
        ],
      },
      {
        data: [
          {
            object: {
              limit: 100,
              name: 'snapshots',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
              usage: 0,
              uuid: 'fcd04f77023a43be931749434cf7b777',
            },
            point: 1527258000,
          },
          {
            object: {
              limit: 100,
              name: 'snapshots',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
              usage: 0,
              uuid: 'fcd04f77023a43be931749434cf7b777',
            },
            point: 1527443142,
          },
          {
            object: {
              limit: 100,
              name: 'snapshots',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/fcd04f77023a43be931749434cf7b777/',
              usage: 0,
              uuid: 'fcd04f77023a43be931749434cf7b777',
            },
            point: 1527628285,
          },
        ],
        loading: false,
        name: 'snapshots',
        uuid: [
          'fcd04f77023a43be931749434cf7b777',
          '9d3bece47e3745f0b6320e49dbe92443',
        ],
      },
      {
        data: [
          {
            object: {
              limit: 100,
              name: 'volumes',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
              usage: 0,
              uuid: '5adbf62179a143e4b4ed29d796976ff1',
            },
            point: 1527258000,
          },
          {
            object: {
              limit: 100,
              name: 'volumes',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
              usage: 0,
              uuid: '5adbf62179a143e4b4ed29d796976ff1',
            },
            point: 1527443142,
          },
          {
            object: {
              limit: 100,
              name: 'volumes',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/5adbf62179a143e4b4ed29d796976ff1/',
              usage: 0,
              uuid: '5adbf62179a143e4b4ed29d796976ff1',
            },
            point: 1527628285,
          },
        ],
        loading: false,
        name: 'volumes',
        uuid: [
          '5adbf62179a143e4b4ed29d796976ff1',
          '26b963516cf04a69ab7a45a2972787d0',
        ],
      },
    ],
  },
  historyQuotas: {
    unnamed: [
      {
        loading: false,
        uuid: '082c6fd918f0432296f00fab0cc30234',
        data: [
          {
            object: {
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              uuid: '082c6fd918f0432296f00fab0cc30234',
              name: 'ram',
              limit: 10240,
              usage: 0,
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
            },
            point: 1526986272,
          },
        ],
      },
    ],
    named: [
      {
        loading: false,
        uuid: '082c6fd918f0432296f00fab0cc30234',
        data: [
          {
            object: {
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              uuid: '082c6fd918f0432296f00fab0cc30234',
              name: 'ram',
              limit: 10240,
              usage: 0,
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
            },
            point: 1526986272,
          },
        ],
        name: 'ram',
      },
    ],
    isLoading: [
      {
        loading: true,
        uuid: '082c6fd918f0432296f00fab0cc30234',
      },
    ],
  },
  resultingQuotas: {
    pieCharts: [
      {
        label: 'RAM',
        limit: 20480,
        name: 'ram',
        scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
        threshold: 0,
        url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
        usage: 2048,
        uuid: [
          '082c6fd918f0432296f00fab0cc30234',
          'ed561cdf1656432494761e457049f337',
        ],
      },
    ],
    barCharts: [
      {
        data: [
          {
            object: {
              limit: 20480,
              name: 'ram',
              scope: 'https://rest-test.nodeconductor.com/api/openstack-tenants/faa3df51b3b949b9ba5c9612a725bf70/',
              threshold: 0,
              url: 'https://rest-test.nodeconductor.com/api/quotas/082c6fd918f0432296f00fab0cc30234/',
              usage: 2048,
              uuid: '082c6fd918f0432296f00fab0cc30234ed561cdf1656432494761e457049f337',
            },
            point: 1527074384,
          },
        ],
        label: 'RAM',
        loading: false,
        name: 'ram',
        uuid: [
          '082c6fd918f0432296f00fab0cc30234',
          'ed561cdf1656432494761e457049f337',
        ],
      },
    ],
  },
};

export const project = {
  url: 'https://example.com/api/projects/0b02d56ebb0d4c6cb00a0728b5d9f349/',
  uuid: '0b02d56ebb0d4c6cb00a0728b5d9f349',
  name: 'SaaS',
  customer: 'https://example.com/api/customers/9f43128e9eb24c288b6577568420dc1c/',
  customer_uuid: '9f43128e9eb24c288b6577568420dc1c',
  customer_name: 'ActiveSys',
  customer_native_name: '',
  customer_abbreviation: '',
  description: '',
  quotas: [quotas.registeredLimited, quotas.registeredUnlimited, quotas.uregistered],
  services: [],
  created: '2016-03-14T19:36:00Z',
  certifications: [],
  type: null,
  type_name: null,
  billing_price_estimate: {},
};

export const pieCharts = {
  limited: {
    id: '082c6fd918f0432296f00fab0cc30234',
    limit: 20480,
    label: 'RAM',
    name: 'ram',
    exceeds: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM',
      },
      tooltip: {},
      series: [
        {
          name: 'RAM',
          type: 'pie',
          legendHoverLink: false,
          hoverAnimation: false,
          hoverOffset: 0,
          clockwise: false,
          labelLine: {
            show: false,
          },
          data: [
            {
              name: 'Usage',
              value: 2048,
            },
            {
              name: 'Remaining limit',
              value: 18432,
            },
          ],
        },
      ],
    },
  },
  limitedExceeded: {
    id: 'c31f80b98c294840a8a62f006f1c655b',
    limit: 200,
    label: 'Snapshots',
    exceeds: true,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'Snapshots',
      },
      tooltip: {},
      series: [
        {
          name: 'Snapshots',
          type: 'pie',
          legendHoverLink: false,
          hoverAnimation: false,
          hoverOffset: 0,
          clockwise: false,
          labelLine: {
            show: false,
          },
          data: [
            {
              name: 'Usage',
              value: 200,
            },
            {
              name: 'Remaining limit',
              value: 0,
            },
          ],
        },
      ],
    },
  },
  unlimited: {
    id: 'db9eab9ab2fb403ab271e783e0f38cd3',
    limit: -1,
    label: 'Volumes',
    exceeds: false,
    options: {},
  },
  resulting: {
    id: '082c6fd918f0432296f00fab0cc30234',
    limit: 20480,
    label: 'RAM',
    exceeds: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM',
      },
      tooltip: {},
      series: [
        {
          name: 'RAM',
          type: 'pie',
          legendHoverLink: false,
          hoverAnimation: false,
          hoverOffset: 0,
          clockwise: false,
          labelLine: {
            show: false,
          },
          data: [
            {
              name: 'Usage',
              value: 2048,
            },
            {
              name: 'Remaining limit',
              value: 18432,
            },
          ],
        },
      ],
    },
  },
};

export const barCharts = {
  common: {
    id: '082c6fd918f0432296f00fab0cc30234',
    label: 'RAM',
    exceeds: false,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      calculable: true,
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: ['18 March', '19 March', '20 March'],
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Usage',
          type: 'bar',
          barGap: 0,
          data: [2048],
        },
        {
          name: 'Limit',
          type: 'bar',
          barGap: 0,
          data: [20480],
        },
      ],
    },
  },
  exceeded: {
    id: '049fab371f2844e79d2997eadfbb4cd6',
    label: 'RAM',
    exceeds: true,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      calculable: true,
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: ['18 March', '19 March', '20 March'],
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Usage',
          type: 'bar',
          barGap: 0,
          data: [26033, 26033, 26033],
        },
        {
          name: 'Limit',
          type: 'bar',
          barGap: 0,
          data: [50000, 50000, 50000],
        },
      ],
    },
  },
  loading: {
    id: '049fab371f2844e79d2997eadfbb4cg4',
    label: 'Snapshots',
    exceeds: true,
    loading: true,
  },
};

export const unsortedObjects = {
  en: [
    { name: 'Sven' },
    { name: 'Peter' },
    { name: 'Meter' },
  ],
  ru: [
    { name: 'Ясон' },
    { name: 'Птолемей' },
    { name: 'Афродита' },
  ],
};
