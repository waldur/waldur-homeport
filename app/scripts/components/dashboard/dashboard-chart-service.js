import { POINTS_COUNT, PROJECT_DASHBOARD, CUSTOMER_DASHBOARD } from './constants';
import { getDashboardQuotas } from './registry';

export default class DashboardChartService {
  // @ngInject
  constructor($q, invoicesService, quotasService, $filter, features, coreUtils) {
    this.$q = $q;
    this.invoicesService = invoicesService;
    this.quotasService = quotasService;
    this.$filter = $filter;
    this.features = features;
    this.coreUtils = coreUtils;
  }

  clearServiceCache() {
    this.invoicesService.clearAllCacheForCurrentEndpoint();
    this.quotasService.clearAllCacheForCurrentEndpoint();
  }

  getOrganizationCharts(organization) {
    const quotas = angular.copy(getDashboardQuotas(CUSTOMER_DASHBOARD));
    this.clearServiceCache();
    if (this.features.isVisible('dashboard.total_cost')) {
      return this.$q.all([
        this.getCostChart(organization),
        this.getResourceHistoryCharts(quotas, organization)
      ]).then(charts => [charts[0]].concat(this.sortCharts(charts[1])));
    } else {
      return this.getResourceHistoryCharts(quotas, organization);
    }
  }

  getProjectCharts(project) {
    const quotas = angular.copy(getDashboardQuotas(PROJECT_DASHBOARD));
    this.clearServiceCache();
    return this.getResourceHistoryCharts(quotas, project);
  }

  getResourceHistoryCharts(charts, scope) {
    charts = charts.filter(chart => !chart.feature || this.features.isVisible(chart.feature));

    let quotaMap = scope.quotas.reduce((map, quota) => {
      map[quota.name] = quota;
      return map;
    }, {});

    let validCharts = charts.filter(chart => !!quotaMap[chart.quota]);

    let promises = validCharts.map(chart => {
      chart.quota = quotaMap[chart.quota];
      return this.getQuotaHistory(chart).then(data => {
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

  getQuotaHistory(chart) {
    const url = chart.quota.url;
    const end = moment.utc().add(1, 'day').unix();
    const start = moment.utc().subtract(1, 'month').unix();

    return this.quotasService.getHistory(url, start, end, POINTS_COUNT).then(items => {
      items = items.filter(item => {
        return !!item.object;
      }).map(item => {
        let value = item.object.usage;
        if (chart.formatter) {
          value = chart.formatter(value);
        }
        return {
          date: moment.unix(item.point).toDate(),
          value
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
        item.label = this.formatCostChartLabel(item.value, item.date, false);
        return item;
      });

      const lastItem = items[items.length - 1];
      const monthEnd = moment().endOf('month').toDate();
      lastItem.label = this.formatCostChartLabel(lastItem.value, monthEnd, true);

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

  formatCostChartLabel(value, date, isEstimate) {
    let template = gettext('{value} at {date}');
    if (isEstimate) {
      template = gettext('{value} at {date}, estimated');
    }
    return this.coreUtils.templateFormatter(template, {
      value: this.$filter('defaultCurrency')(value),
      date: this.$filter('date', 'yyyy-MM')(date)
    });
  }

  padMissingValues(items, interval) {
    let i = 1, end = moment();
    if (items.length > 0) {
      end = moment(items[items.length - 1].date);
    }
    while(items.length !== POINTS_COUNT) {
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
    let last = items[0];
    let prev = items[1];
    let change = Math.round(100 * (last - prev) / prev);
    return Math.min(100, Math.max(-100, change));
  }
}
