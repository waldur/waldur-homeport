export const quotas = {
  exceeded: {
    uuid: '049fab371f2844e79d2997eadfbb4cd6',
    name: 'snapshots',
    label: 'Snapshot size, GB',
    limit: 26033,
    usage: 26033,
  },
};

export const project = {
  uuid: '0b02d56ebb0d4c6cb00a0728b5d9f349',
  name: 'SaaS',
};

export const pieCharts = {
  limited: {
    id: '082c6fd918f0432296f00fab0cc30234',
    limit: 20480,
    label: 'Batch RAM usage, GB',
    name: 'ram',
    exceeds: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'Batch RAM usage, GB',
      },
      tooltip: {},
      series: [
        {
          name: 'Batch RAM usage, GB',
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
    label: 'Snapshot size, GB',
    exceeds: true,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'Snapshot size, GB',
      },
      tooltip: {},
      series: [
        {
          name: 'Snapshot size, GB',
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
    label: 'Volume count',
    exceeds: false,
    options: {},
  },
};

export const barCharts = {
  common: {
    id: '082c6fd918f0432296f00fab0cc30234',
    label: 'Batch RAM usage, GB',
    exceeds: false,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'Batch RAM usage, GB',
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
    label: 'Batch RAM usage, GB',
    exceeds: true,
    loading: false,
    options: {
      color: ['rgb(255, 159, 64)', 'rgb(54, 162, 235)'],
      title: {
        text: 'Batch RAM usage, GB',
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
};
