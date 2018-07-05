import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { project, quotas, pieCharts, barCharts } from './fixture';
import { PureResourceAnalysisItem } from './ResourceAnalysisItem';

const initialProps = {
  exceededQuotas: [quotas.exceeded],
  project,
  pieChartsData: [pieCharts.limited, pieCharts.limitedExceeded],
  barChartsData: [barCharts.common, barCharts.exceeded],
  translate,
  handleToggleOpen: () => null,
  isOpen: false,
};
const renderWrapper = (props?) => shallow(<PureResourceAnalysisItem {...initialProps} {...props} />);

const getPieChartsListContent = (container: ShallowWrapper) => container.find('.resource-analysis-item__pie-chart-list .chart-content');
const getPieChartsListTitle = (container: ShallowWrapper) => container.find('.resource-analysis-item__pie-chart-list .chart-title');
const getBarChartsList = (container: ShallowWrapper) => container.find('.resource-analysis-item__bar-chart-list');
const getBarChartsListTitle = (container: ShallowWrapper) => container.find('.resource-analysis-item__bar-chart-list .chart-title');
const getPieCharts = (container: ShallowWrapper) => getPieChartsListContent(container).find(EChart);
const getBarCharts = (container: ShallowWrapper) => getBarChartsList(container).find(EChart);
const getTitle = (container: ShallowWrapper) => container.find('.resource-analysis-item__title');
const getTooltip = (container: ShallowWrapper) => getTitle(container).find(Tooltip);

describe('PureResourceAnalysisItem', () => {
  it('renders pie charts', () => {
    const wrapper = renderWrapper();
    expect(getPieCharts(wrapper).length).toBe(2);
    expect(getBarCharts(wrapper).length).toBe(0);
  });

  it('renders classname on exceeded quota title', () => {
    const wrapper = renderWrapper({ pieChartsData: [pieCharts.limitedExceeded] });
    expect(getPieChartsListTitle(wrapper).hasClass('text-danger')).toBe(true);
  });

  it('renders "unlimited" text if quota is unlimited', () => {
    const wrapper = renderWrapper({ pieChartsData: [pieCharts.unlimited] });
    expect(getPieChartsListContent(wrapper).text()).toBe('Unlimited');
  });

  it('renders bar if project is opened', () => {
    const wrapper = renderWrapper({ isOpen: true });
    expect(getTitle(wrapper).hasClass('opened')).toBe(true);
    expect(getPieCharts(wrapper).length).toBe(0);
    expect(getBarCharts(wrapper).length).toBe(2);
  });

  it('renders class name on exceeded quota title', () => {
    const wrapper = renderWrapper({
      isOpen: true,
      barChartsData: [barCharts.exceeded],
    });
    expect(getBarChartsListTitle(wrapper).hasClass('text-danger')).toBe(true);
  });

  it('renders tooltip and class name on exceeded project title', () => {
    const wrapper = renderWrapper();
    expect(getTitle(wrapper).find('h4').hasClass('text-danger')).toBe(true);
    expect(getTooltip(wrapper).length).toBe(1);
  });

  it('renders loading spinner on bar chart data fetching', () => {
    const wrapper = renderWrapper({
      isOpen: true,
      barChartsLoading: true,
    });
    expect(getBarChartsList(wrapper).find(LoadingSpinner).length).toBe(1);
  });
});
