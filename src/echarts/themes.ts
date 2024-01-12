/**
 * https://echarts.apache.org/en/download-theme.html
 * dark-metronic theme
 */

const echarts = require('echarts');

function registerDarkTheme() {
  const log = function (msg) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log('ECharts is not Loaded');
    return;
  }
  const contrastColor = '#eee';
  const axisCommon = function () {
    return {
      axisLine: {
        lineStyle: {
          color: contrastColor,
        },
      },
      axisTick: {
        lineStyle: {
          color: contrastColor,
        },
      },
      axisLabel: {
        textStyle: {
          color: contrastColor,
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#aaa',
        },
        show: undefined,
      },
      splitArea: {
        areaStyle: {
          color: contrastColor,
        },
      },
    };
  };

  const colorPalette = [
    '#dd6b66',
    '#759aa0',
    '#e69d87',
    '#8dc1a9',
    '#ea7e53',
    '#eedd78',
    '#73a373',
    '#73b9bc',
    '#7289ab',
    '#91ca8c',
    '#f49f42',
  ];
  const theme = {
    color: colorPalette,
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: contrastColor,
        },
        crossStyle: {
          color: contrastColor,
        },
      },
    },
    legend: {
      textStyle: {
        color: contrastColor,
      },
    },
    textStyle: {
      color: contrastColor,
    },
    title: {
      textStyle: {
        color: contrastColor,
      },
    },
    toolbox: {
      iconStyle: {
        normal: {
          borderColor: contrastColor,
        },
      },
    },
    dataZoom: {
      textStyle: {
        color: contrastColor,
      },
    },
    timeline: {
      lineStyle: {
        color: contrastColor,
      },
      itemStyle: {
        normal: {
          color: colorPalette[1],
        },
      },
      label: {
        normal: {
          textStyle: {
            color: contrastColor,
          },
        },
      },
      controlStyle: {
        normal: {
          color: contrastColor,
          borderColor: contrastColor,
        },
      },
    },
    timeAxis: axisCommon(),
    logAxis: axisCommon(),
    valueAxis: axisCommon(),
    categoryAxis: axisCommon(),

    line: {
      symbol: 'circle',
    },
    graph: {
      color: colorPalette,
    },
    gauge: {
      title: {
        textStyle: {
          color: contrastColor,
        },
      },
    },
    candlestick: {
      itemStyle: {
        normal: {
          color: '#FD1050',
          color0: '#0CF49B',
          borderColor: '#FD1050',
          borderColor0: '#0CF49B',
        },
      },
    },
  };
  theme.categoryAxis.splitLine.show = false;
  echarts.registerTheme('dark-metronic', theme);
}

/**
 * light-metronic theme
 */
function registerLightTheme() {
  const log = function (msg) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log('ECharts is not Loaded');
    return;
  }

  const colorPalette = [
    '#c12e34',
    '#e6b600',
    '#0098d9',
    '#2b821d',
    '#005eaa',
    '#339ca8',
    '#cda819',
    '#32a487',
  ];

  const theme = {
    color: colorPalette,

    title: {
      textStyle: {
        fontWeight: 'normal',
      },
    },

    visualMap: {
      color: ['#1790cf', '#a2d4e6'],
    },

    toolbox: {
      iconStyle: {
        normal: {
          borderColor: '#06467c',
        },
      },
    },

    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.6)',
    },

    dataZoom: {
      dataBackgroundColor: '#dedede',
      fillerColor: 'rgba(154,217,247,0.2)',
      handleColor: '#005eaa',
    },

    timeline: {
      lineStyle: {
        color: '#005eaa',
      },
      controlStyle: {
        normal: {
          color: '#005eaa',
          borderColor: '#005eaa',
        },
      },
    },

    candlestick: {
      itemStyle: {
        normal: {
          color: '#c12e34',
          color0: '#2b821d',
          lineStyle: {
            width: 1,
            color: '#c12e34',
            color0: '#2b821d',
          },
        },
      },
    },

    graph: {
      color: colorPalette,
    },

    map: {
      label: {
        normal: {
          textStyle: {
            color: '#c12e34',
          },
        },
        emphasis: {
          textStyle: {
            color: '#c12e34',
          },
        },
      },
      itemStyle: {
        normal: {
          borderColor: '#eee',
          areaColor: '#ddd',
        },
        emphasis: {
          areaColor: '#e6b600',
        },
      },
    },

    gauge: {
      axisLine: {
        show: true,
        lineStyle: {
          color: [
            [0.2, '#2b821d'],
            [0.8, '#005eaa'],
            [1, '#c12e34'],
          ],
          width: 5,
        },
      },
      axisTick: {
        splitNumber: 10,
        length: 8,
        lineStyle: {
          color: 'auto',
        },
      },
      axisLabel: {
        textStyle: {
          color: 'auto',
        },
      },
      splitLine: {
        length: 12,
        lineStyle: {
          color: 'auto',
        },
      },
      pointer: {
        length: '90%',
        width: 3,
        color: 'auto',
      },
      title: {
        textStyle: {
          color: '#333',
        },
      },
      detail: {
        textStyle: {
          color: 'auto',
        },
      },
    },
  };
  echarts.registerTheme('light-metronic', theme);
}

registerDarkTheme();
registerLightTheme();
