import * as moment from 'moment-timezone';

import { translate } from '@waldur/i18n';

import { getEstimatedPrice } from '../utils';

const uniqueArray = items => {
  return items.filter((elem, pos) => {
    return items.indexOf(elem) === pos;
  });
};

const getValue = (path, source) =>
  path.reduce((part, item) => part && part[item], source);

const sortDates = dates => dates.sort((left, right) => left.diff(right));

const parseDate = row => moment({ year: row.year, month: row.month - 1 });

const formatDate = date => date.format('MMMM, Y');

const getLabels = rows =>
  uniqueArray(sortDates(rows.map(parseDate)).map(formatDate));

const getUserMap = (palette, rows) =>
  rows.reduce(
    (map, row) => ({
      ...map,
      [row.username]: {
        full_name: row.full_name,
        color: palette[Object.keys(map).length % palette.length],
        freeipa_name: row.username,
      },
    }),
    {},
  );

const getUsers = userMap =>
  Object.keys(userMap).map(username => userMap[username]);

const getReport = rows =>
  rows.reduce((report, row) => {
    if (!report[row.username]) {
      report[row.username] = {};
    }
    report[row.username][formatDate(parseDate(row))] = row;
    return report;
  }, {});

const round = value => Math.round(value * 100) / 100;

const getChartValue = (report, chart, username, label) => {
  const value = getValue([username, label, chart.field], report) || 0;
  if (chart.factor) {
    return round(value / chart.factor);
  } else {
    return value;
  }
};

const getUsageCharts = (chartSpec, report, userMap, labels) =>
  chartSpec.map(chart => {
    const datasets = Object.keys(report).map(username => ({
      label: userMap[username].full_name || userMap[username].freeipa_name,
      data: labels.map(label => getChartValue(report, chart, username, label)),
      backgroundColor: userMap[username].color,
    }));
    return {
      name: chart.name,
      labels,
      datasets,
    };
  });

const getUserCost = (report, username, label, pricePackage) =>
  getEstimatedPrice(
    {
      cpu: getValue([username, label, 'cpu_usage'], report) || 0,
      gpu: getValue([username, label, 'gpu_usage'], report) || 0,
      ram: getValue([username, label, 'ram_usage'], report) || 0,
    },
    pricePackage,
  );

const getCostChart = (report, userMap, labels, pricePackage) => {
  const datasets = Object.keys(report).map(username => ({
    label: userMap[username].full_name || userMap[username].freeipa_name,
    data: labels.map(label =>
      getUserCost(report, username, label, pricePackage),
    ),
    backgroundColor: userMap[username].color,
  }));
  return {
    name: translate('Costs'),
    labels,
    datasets,
  };
};

export function formatCharts(palette, chartSpec, rows, pricePackage) {
  const labels = getLabels(rows);
  const userMap = getUserMap(palette, rows);
  const report = getReport(rows);
  const charts = getUsageCharts(chartSpec, report, userMap, labels);
  if (pricePackage) {
    const costChart = getCostChart(report, userMap, labels, pricePackage);
    charts.unshift(costChart);
  }
  const users = getUsers(userMap);
  return { users, charts };
}
