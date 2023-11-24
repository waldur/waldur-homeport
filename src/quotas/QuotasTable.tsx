import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { EChart } from '@waldur/core/EChart';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { themeSelector } from '@waldur/navigation/theme/store';

import { QUOTA_CATEGORIES } from './constants';
import { Quota } from './types';
import { formatQuotaValue, formatQuotaName } from './utils';

interface Resource {
  quotas: Quota[];
}

const ResourceQuotaChart = ({ value, max }) => {
  const empty = Math.max(max - value, 0);

  let color = '#108F10';
  const percentage = (value / max) * 100;
  if (percentage > 95) color = '#CC0808';
  else if (percentage > 60) color = '#FCCF5C';

  const theme = useSelector(themeSelector);

  const chartOptions = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: '100%',
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { value, name: translate('Used'), itemStyle: { color } },
          {
            value: empty,
            name: translate('Free'),
            itemStyle: { color: theme === 'light' ? '#f5f8fa' : '#1a261d' },
          },
        ],
        animation: false,
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return max === Infinity ? (
    <div className="symbol symbol-65px symbol-circle">
      <ImagePlaceholder
        width="65px"
        height="65px"
        backgroundColor="transparent"
      >
        <div className="symbol-label fs-1 fw-bolder text-muted w-100 h-100">
          {value}
        </div>
      </ImagePlaceholder>
    </div>
  ) : (
    <EChart options={chartOptions} height="65px" width="65px" />
  );
};

const ResourceQuotaItem = ({ quota }: { quota: Quota }) => {
  const data = useMemo(() => {
    const formattedUsage = formatQuotaValue(quota.usage, quota.name);
    const formattedLimit = formatQuotaValue(quota.limit, quota.name);
    let usage, usageValue;
    if (formattedUsage === '∞') {
      usage = formattedUsage;
      usageValue = Infinity;
    } else {
      usage = String(formattedUsage).match(/\d+/)[0];
      usageValue = Number(usage);
    }
    let limitValue;
    const limit = formattedLimit;
    if (formattedLimit === '∞') {
      limitValue = Infinity;
    } else {
      limitValue = Number(String(formattedLimit).match(/\d+/)[0]);
    }
    return { usage, usageValue, limit, limitValue };
  }, [quota]);

  return (
    <div className="resource-quota-item fw-bold d-flex mb-6">
      <ResourceQuotaChart value={data.usageValue} max={data.limitValue} />
      <div className="ms-3">
        <span className="d-block">
          <span className="fs-4">{data.usage}</span>
          <span className="fs-7">/{data.limit}</span>
        </span>
        <span className="d-block fs-7">{formatQuotaName(quota.name)}</span>
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
    <div className="row text-center">
      {translate('You have no quotas yet.')}
    </div>
  ) : (
    <div className="provider-quotas">
      {quotaCategories.categories.map((group) => (
        <div className="my-6" key={group.key}>
          <h5 className="fw-bold mb-6">{group.label}</h5>
          <Row>
            {group.quotas.map((quota) => (
              <Col xs={6} md={4} lg={3} key={quota.name}>
                <ResourceQuotaItem quota={quota} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
      {quotaCategories.additional.length > 0 && (
        <div>
          <h5 className="fw-bold mb-6">{translate('Additional quotas')}</h5>
          {quotaCategories.additional.map((quota) => (
            <Row key={quota.name} className="mb-2">
              <Col sm={4} xs={6}>
                {formatQuotaName(quota.name)}:
              </Col>
              <Col sm={8} xs={6}>
                {translate('{usage} of {limit}', {
                  usage: formatQuotaValue(quota.usage, quota.name),
                  limit: formatQuotaValue(quota.limit, quota.name),
                })}
              </Col>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
};
