import echarts from 'echarts';
import * as React from 'react';

import { ngInjector, ENV } from '@waldur/core/services';
import { connectAngularComponent } from '@waldur/store/connect';

const formatUtil = echarts.format;

function getLevelOption() {
  return [
      {
          itemStyle: {
              normal: {
                  borderColor: '#777',
                  borderWidth: 0,
                  gapWidth: 1,
              },
          },
          upperLabel: {
              normal: {
                  show: false,
              },
          },
      },
      {
          itemStyle: {
              normal: {
                  borderColor: '#555',
                  borderWidth: 5,
                  gapWidth: 1,
              },
              emphasis: {
                  borderColor: '#ddd',
              },
          },
      },
      {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
              normal: {
                  borderWidth: 5,
                  gapWidth: 1,
                  borderColorSaturation: 0.6,
              },
          },
      },
  ];
}

class DynamicTreemapExample extends React.Component {
  container = undefined;
  chart = undefined;

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    this.chart.dispose();
  }

  drawChart() {
    const chart = echarts.getInstanceByDom(this.container);
    if (!chart) {
      this.chart = echarts.init(this.container);
    }

    this.chart.showLoading();
    this.loadData().then(data => {
        this.chart.hideLoading();
        this.renderChart(data);
    }, 3000);
  }

  loadData() {
    const HttpUtils = ngInjector.get('HttpUtils');
    const request = HttpUtils.getAll(`${ENV.apiEndpoint}api/projects/`, {
        field: ['name', 'customer_name', 'quotas'],
    });
    return request.then(projects => {
        const customers = {};

        for (const project of projects) {
            const quotas = {};
            for (const quota of project.quotas) {
                quotas[quota.name] = quota.usage;
            }
            if (!customers[project.customer_name]) {
                customers[project.customer_name] = {};
            }
            customers[project.customer_name][project.name] = quotas;
        }

        const tree = [];
        for (const customer of Object.keys(customers)) {
            const customerProjects = customers[customer];
            let total = 0;
            const children = [];
            for (const project of Object.keys(customerProjects)) {
                const quotas = customerProjects[project];
                const value = quotas.nc_resource_count;
                total += value;
                children.push({
                    name: project,
                    path: `${customer}/${project}`,
                    value,
                });
            }
            tree.push({
                name: customer,
                path: customer,
                value: total,
                children,
            });
        }
        return tree;
    });
  }

  renderChart(diskData) {
    this.chart.setOption({

      title: {
          text: 'Resources usage',
          left: 'center',
      },

      tooltip: {
          formatter: info => {
              const value = info.value;
              const treePathInfo = info.treePathInfo;
              const treePath = [];

              for (let i = 1; i < treePathInfo.length; i++) {
                  treePath.push(treePathInfo[i].name);
              }

              return [
                  '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                  'Resources usage: ' + formatUtil.addCommas(value) + ' resources',
              ].join('');
          },
      },

      series: [
          {
              name: 'Resources usage',
              type: 'treemap',
              visibleMin: 300,
              label: {
                  show: true,
                  formatter: '{b}',
              },
              upperLabel: {
                  normal: {
                      show: true,
                      height: 30,
                  },
              },
              itemStyle: {
                  normal: {
                      borderColor: '#fff',
                  },
              },
              levels: getLevelOption(),
              data: diskData,
          },
      ],
    });
  }

  render() {
    return (
      <div
        style={{width: '100%', height: 500}}
        ref={container => this.container = container}
      />
    );
  }
}

export default connectAngularComponent(DynamicTreemapExample);
