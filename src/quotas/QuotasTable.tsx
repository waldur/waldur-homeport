import { EChartsOption } from 'echarts';
import { useMemo } from 'react';

import { ENV } from '@/core/config';
import { EChart } from '@/core/EChart';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

import { QUOTA_CATEGORIES } from './constants';
import { Quota } from './types';
import { formatQuota, formatQuotaName, formatQuotaValue } from './utils';

interface Resource {
  quotas: Quota[];
}

const ResourceQuotaChart = ({ value, max }) => {
  const empty = Math.max(max - value, 0);

  let color = ENV.plugins?.WALDUR_CORE?.BRAND_COLOR || '#108F10';
  const percentage = (value / max) * 100;
  if (percentage > 95) color = '#CC0808';
  else if (percentage > 60) color = '#FCCF5C';

  const { theme } = useTheme();

  const chartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: '95%',
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { value, name: translate('Used'), itemStyle: { color } },
          {
            value: empty,
            name: translate('Free'),
            itemStyle: { color: theme === 'light' ? '#f5f8fa' : '#1a261d' },
            emphasis: {
              itemStyle: { color: theme === 'light' ? '#f5f8fa' : '#1a261d' },
            },
          },
        ],

        animation: false,
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          scaleSize: 2,
        },
      },
    ],
  };

  return max === Infinity ? (
    <ImagePlaceholder
      width="65px"
      height="65px"
      backgroundColor="transparent"
      circle
    >
      <span className="text-2xl font-semibold text-quaternary">{value}</span>
    </ImagePlaceholder>
  ) : (
    <EChart options={chartOptions} height="65px" width="65px" />
  );
};

const ResourceQuotaItem = ({ quota }: { quota: Quota }) => {
  const data = useMemo(() => formatQuota(quota), [quota]);

  return (
    <div className="font-medium flex mb-5">
      <ResourceQuotaChart value={data.usageValue} max={data.limitValue} />
      <div className="ms-2.5">
        <span className="block">
          <span className="text-base">{data.usage}</span>
          <span className="text-xs">/{data.limit}</span>
        </span>
        <span className="block text-xs">{formatQuotaName(quota.name)}</span>
      </div>
    </div>
  );
};

export const QuotasTable = ({ resource }: { resource: Resource }) => {
  const quotaCategories = useMemo(() => {
    const categories = Object.entries(QUOTA_CATEGORIES)
      .map(([key, category]) => {
        const quotas = resource.quotas
          .filter((q) => {
            return category.names.some((name) =>
              name instanceof RegExp ? name.test(q.name) : name === q.name,
            );
          })
          .sort((q1, q2) => q1.name.localeCompare(q2.name));
        if (quotas.length > 0) {
          return { key, label: category.label, quotas };
        } else return null;
      })
      .filter(Boolean);

    const categorizedNames = Object.values(QUOTA_CATEGORIES)
      .map((cat) => cat.names)
      .flat();
    const additional = resource.quotas
      .filter(
        (q) =>
          !categorizedNames.some((name) =>
            name instanceof RegExp ? name.test(q.name) : q.name === name,
          ),
      )
      .sort((q1, q2) => q1.name.localeCompare(q2.name));
    return { categories, additional };
  }, [resource]);

  return resource.quotas.length === 0 ? (
    <div className="text-center">{translate('You have no quotas yet.')}</div>
  ) : (
    <div>
      {quotaCategories.categories.map((group) => (
        <div className="my-5" key={group.key}>
          <h5 className="font-medium mb-5">{group.label}</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5">
            {group.quotas.map((quota) => (
              <ResourceQuotaItem key={quota.name} quota={quota} />
            ))}
          </div>
        </div>
      ))}
      {quotaCategories.additional.length > 0 && (
        <div>
          <h5 className="font-medium mb-5">{translate('Additional quotas')}</h5>
          {quotaCategories.additional.map((quota) => (
            <div key={quota.name} className="grid grid-cols-12 gap-x-5 mb-1.5">
              <div className="col-span-6 sm:col-span-4">
                {formatQuotaName(quota.name)}:
              </div>
              <div className="col-span-6 sm:col-span-8">
                {translate('{usage} of {limit}', {
                  usage: formatQuotaValue(quota.usage, quota.name),
                  limit: formatQuotaValue(quota.limit, quota.name),
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
