export const quotas = {
  registeredLimited: {
    url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'nc_ram_usage',
    label: 'RAM usage',
    limit: 5000,
    usage: 26033,
  },
  registeredUnlimited: {
    url: 'https://example.com/api/quotas/049fab371f2844e79d2997eadfbb4cd6/',
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'nc_snapshots',
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

export const barCharts = {
  common: {
    id: '049fab371f2844e79d2997eadfbb4cd6',
    label: 'RAM usage',
    exceeds: false,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM usage',
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
  exceeded: {
    id: '049fab371f2844e79d2997eadfbb4cd6',
    label: 'RAM usage',
    exceeds: true,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM usage',
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

export const pieCharts = {
  limited: {
    id: '049fab371f2844e79d2997eadfbb4cd6',
    limit: 50000,
    label: 'RAM usage',
    exceeds: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'RAM usage',
      },
      tooltip: {},
      series: [
        {
          name: 'RAM usage',
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
              value: 30000,
            },
            {
              name: 'Remaining limit',
              value: 20000,
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
};
