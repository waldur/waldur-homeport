import { connect, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { compose } from 'redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { TranslateProps, withTranslation, translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { loadData, parseProjects } from './api';
import { treemapFilterSelector } from './selectors';
import { TreemapChart } from './TreemapChart';
import { TreemapChartFilter } from './TreemapChartFilter';
import { QuotaList, QuotaChoice } from './types';

const getQuotas = (hidden: boolean): QuotaList => [
  {
    key: 'nc_resource_count',
    title: translate('Resources'),
  },
  {
    key: 'current_price',
    title: translate('Current price per month'),
    tooltipValueFormatter: (value) => defaultCurrency(value),
    hidden,
  },
  {
    key: 'estimated_price',
    title: translate('Esimated price per month'),
    tooltipValueFormatter: (value) => defaultCurrency(value),
    hidden,
  },
  {
    key: 'vpc_cpu_count',
    title: translate('VPC vCPU'),
  },
  {
    key: 'vpc_ram_size',
    title: translate('VPC RAM'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'vpc_storage_size',
    title: translate('VPC block storage size'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'vpc_floating_ip_count',
    title: translate('VPC floating IP count'),
  },
  {
    key: 'vpc_instance_count',
    title: translate('VPC instance count'),
  },
  {
    key: 'os_cpu_count',
    title: translate('Cloud vCPU'),
  },
  {
    key: 'os_ram_size',
    title: translate('Cloud RAM'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'os_storage_size',
    title: translate('Cloud block storage size'),
    tooltipValueFormatter: formatFilesize,
  },
];

const calculateTotal = (data) =>
  parseInt(
    data.reduce((t, entry) => t + (isNaN(entry.value) ? 0 : entry.value), 0),
    10,
  );

interface StateProps {
  accounting_is_running: boolean;
  quota: QuotaChoice;
}

const TreemapContainer = (props: StateProps & TranslateProps) => {
  useTitle(translate('Resources usage'));
  useReportingBreadcrumbs();
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );

  const quotas = getQuotas(shouldConcealPrices).filter(
    (quota) => !quota.hidden,
  );
  let tooltipValueFormatter;

  if (props.quota) {
    const quota = quotas.find((item) => item.key === props.quota.key);
    tooltipValueFormatter = quota.tooltipValueFormatter;
  }

  const {
    loading,
    error,
    value: data,
  } = useAsync(() => loadData(props.quota?.key), [props.quota]);
  const chartData = data ? parseProjects(data) : [];
  let total = 0;
  if (props.quota && data) {
    total = calculateTotal(chartData);
  }
  return (
    <>
      <TreemapChartFilter quotas={quotas} loading={loading} total={total} />
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load locations.')}</>
      ) : (
        <TreemapChart
          title={props.translate('Resource usage')}
          width="100%"
          height={500}
          data={chartData}
          tooltipValueFormatter={tooltipValueFormatter}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  accounting_is_running: treemapFilterSelector(state, 'accounting_is_running'),
  quota: treemapFilterSelector(state, 'quota'),
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const ResourcesTreemap = enhance(TreemapContainer);
