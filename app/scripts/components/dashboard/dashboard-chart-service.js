import {
  POINTS_COUNT,
  DASHBOARD_QUOTAS,
  PROJECT_DASHBOARD_QUOTAS,
  ORGANIZATION_DASHBOARD_QUOTAS
} from './constants';

// @ngInject
export default class DashboardChartService {
  constructor($q, invoicesService, quotasService, $filter, features) {
    this.$q = $q;
    this.invoicesService = invoicesService;
    this.quotasService = quotasService;
    this.$filter = $filter;
    this.features = features;
  }

  clearServiceCache() {
    this.invoicesService.clearAllCacheForCurrentEndpoint();
    this.quotasService.clearAllCacheForCurrentEndpoint();
  }

  getOrganizationCharts(organization) {
    const quotas = this.getDashboardQuotas(ORGANIZATION_DASHBOARD_QUOTAS);
    this.clearServiceCache();
    if (this.features.isVisible('dashboard.total_cost')) {
      return this.$q.all([
        this.getCostChart(organization),
        this.getResourceHistoryCharts(quotas, organization)
      ]).then(charts => [charts[0]].concat(charts[1])).then(this.sortCharts.bind(this));
    } else {
      return this.getResourceHistoryCharts(quotas, organization);
    }
  }

  getProjectCharts(project) {
    const quotas = this.getDashboardQuotas(PROJECT_DASHBOARD_QUOTAS);
    this.clearServiceCache();
    return this.getResourceHistoryCharts(quotas, project);
  }

  getDashboardQuotas(items) {
    return items.map(quota => angular.extend({quota: quota}, DASHBOARD_QUOTAS[quota]));
  }

  getResourceHistoryCharts(charts, scope) {
    charts = charts.filter(chart => !chart.feature || this.features.isVisible(chart.feature));

    var quotaMap = scope.quotas.reduce((map, quota) => {
      map[quota.name] = quota;
      return map;
    }, {});

    var validCharts = charts.filter(chart => !!quotaMap[chart.quota]);

    var promises = validCharts.map(chart => {
      chart.quota = quotaMap[chart.quota];
      return this.getQuotaHistory(chart.quota.url).then(data => {
        chart.current = data[data.length - 1].value;
        chart.data = data;
      });
    });

    return this.$q.all(promises).then(() => {
      angular.forEach(validCharts, chart => {
        if (chart.data && chart.data.length > 1) {
          chart.change = this.getRelativeChange([
            chart.data[chart.data.length - 1].value,
            chart.data[chart.data.length - 2].value
          ]);
        }
      });
      return this.sortCharts(validCharts);
    });
  }

  sortCharts(charts) {
    return charts.sort((c1, c2) => c1.title.localeCompare(c2.title));
  }

  getQuotaHistory(url) {
    var end = moment.utc().add(1, 'day').unix();
    var start = moment.utc().subtract(1, 'month').unix();

    return this.quotasService.getHistory(url, start, end, POINTS_COUNT).then(items => {
      items = items.filter(item => {
        return !!item.object;
      }).map(item => {
        return {
          date: moment.unix(item.point).toDate(),
          value: item.object.usage
        };
      });

      items = this.padMissingValues(items);

      return items.map(item => {
        item.label = item.value + ' at ' + this.$filter('date', 'yyyy-MM-dd')(item.date);
        return item;
      });
    });
  }

  getCostChart(scope) {
    return this.invoicesService.getList({
      customer: scope.url,
      field: ['year', 'month', 'price']
    }).then(invoices => {
      let items = invoices.map(invoice => {
        return {
          value: invoice.price,
          date: new Date(invoice.year, invoice.month - 1, 1)
        };
      });

      items.reverse();
      items = this.padMissingValues(items, 'month');
      items = items.map(item => {
        item.label = this.$filter('defaultCurrency')(item.value) +  ' at ' +
                     this.$filter('date', 'yyyy-MM')(item.date);
        return item;
      });
      return {
        title: gettext('Total cost'),
        data: items,
        current: this.$filter('defaultCurrency')(items[items.length - 1].value),
        change: this.getRelativeChange([
          items[items.length - 1].value,
          items[items.length - 2].value
        ])
      };
    });
  }

  padMissingValues(items, interval) {
    var i = 1, end = moment();
    if (items.length > 0) {
      end = moment(items[items.length - 1].date);
    }
    while(items.length != POINTS_COUNT) {
      items.unshift({
        value: 0,
        date: new Date(end.subtract(i, interval).toDate())
      });
    }
    return items;
  }

  getRelativeChange(items) {
    if (items.length < 2) {
      return null;
    }
    // Latest values come first
    var last = items[0];
    var prev = items[1];
    var change = Math.round(100 * (last - prev) / prev);
    return Math.min(100, Math.max(-100, change));
  }
}
