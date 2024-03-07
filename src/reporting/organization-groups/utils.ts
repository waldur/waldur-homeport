import { interpolateInferno } from 'd3-scale-chromatic';
import { DateTime } from 'luxon';

import { translate } from '@waldur/i18n';

const calculatePoint = (i, intervalSize, colorRangeInfo) => {
  const { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return useEndAsStart
    ? colorEnd - i * intervalSize
    : colorStart + i * intervalSize;
};

const interpolateColors = (dataLength, colorScale, colorRangeInfo) => {
  const { colorStart, colorEnd } = colorRangeInfo;
  const colorRange = colorEnd - colorStart;
  const intervalSize = colorRange / dataLength;
  let i, colorPoint;
  const colorArray = [];

  for (i = 0; i < dataLength; i++) {
    colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
    colorArray.push(colorScale(colorPoint));
  }

  return colorArray;
};

const getEChartOption = (chartData) => ({
  toolbox: {
    feature: {
      saveAsImage: {
        title: translate('Save'),
        name: `Organizations-by-organization-groups-chart-${DateTime.now().toISODate()}`,
        show: true,
      },
    },
  },
  series: {
    type: 'sunburst',
    highlightPolicy: 'ancestor',
    data: chartData,
    radius: [0, '90%'],
    label: {
      rotate: 'radial',
    },
  },
});

export const generateColors = (amount: number, colorRangeInfo): string[] =>
  interpolateColors(amount, interpolateInferno, colorRangeInfo);

const buildOrganizationGroupsHierarchy = (array) => {
  const COLORS = generateColors(array.length, {
    colorStart: 0.2,
    colorEnd: 0.8,
    useEndAsStart: false,
  });

  const roots = [],
    children = {};

  // find the top level nodes and hash the children based on parent
  for (let i = 0, len = array.length; i < len; ++i) {
    const item = array[i],
      p = item.parent_uuid,
      target = !p ? roots : children[p] || (children[p] = []);
    target.push({
      ...item,
      itemStyle: {
        color: COLORS[i],
      },
    });
  }

  // function to recursively build the tree
  const findChildren = (parent) => {
    if (children[parent.uuid]) {
      parent.children = children[parent.uuid];
      for (let i = 0, len = parent.children.length; i < len; ++i) {
        findChildren(parent.children[i]);
      }
    }
  };

  // enumerate through to handle the case where there are multiple roots
  for (let i = 0, len = roots.length; i < len; ++i) {
    findChildren(roots[i]);
  }

  return roots;
};

const addCustomersWithoutOrganizationGroup = (data, customers) => {
  const totalNumberOfCustomersWithoutOrganizationGroup = customers.reduce(
    (acc, customer) => (!customer.division_uuid ? acc + 1 : acc),
    0,
  );
  data.push({
    name: 'Uncategorized',
    value: totalNumberOfCustomersWithoutOrganizationGroup,
    itemStyle: {
      color: '#C0C0C0',
    },
  });
};

const addValueToOrganizationGroups = (organizationGroups, customers) =>
  organizationGroups.map((organizationGroup) => {
    const countOccurrences = customers.reduce(
      (acc, customer) =>
        customer.division_uuid === organizationGroup.uuid ? acc + 1 : acc,
      0,
    );
    return { ...organizationGroup, value: countOccurrences };
  });

export const getEChartOptions = ({ organizationGroups, customers }) => {
  organizationGroups = addValueToOrganizationGroups(
    organizationGroups,
    customers,
  );
  const data = buildOrganizationGroupsHierarchy(organizationGroups);
  addCustomersWithoutOrganizationGroup(data, customers);
  return getEChartOption(data);
};
