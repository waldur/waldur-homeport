import React, { ReactNode, useId } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
  StatCard,
} from 'waldur-ui';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

interface ClusterResources {
  totalNodes: number;
  totalWorkerNodes: number;
  totalStorageNodes: number;
  totalControllerNodes: number;
  totalLoadBalancerNodes: number;
  totalVCpus: number;
  totalRam: number;
  totalSystemStorage: number;
  totalDataStorage: number;
  totalSanStorage: number;
}

interface K8sTotalResourcesCardProps {
  totalResources: ClusterResources;
  datacenterCount: number;
  controllerTooltip?: string;
  loadBalancerTooltip?: string;
}

/** A tile's figure, with its unit set smaller so the number leads. */
const Figure = ({ value, unit }: { value: number; unit?: string }) => (
  <span className="tabular-nums">
    {formatUsageValue(value, false)}
    {unit && (
      <>
        {' '}
        <span className="text-xs font-normal text-tertiary">{unit}</span>
      </>
    )}
  </span>
);

/** A titled part of the breakdown; its list comes from the caller. */
const Breakdown = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h4 id={id} className="m-0 mb-1 text-xs font-medium text-tertiary">
        {title}
      </h4>
      {children}
    </section>
  );
};

/**
 * The totals of the cluster being configured: the three figures that size it
 * as tiles, then what they are made of. The node roles add up to the Nodes
 * tile, and the disks to the storage total.
 */
export const K8sTotalResourcesCard: React.FC<K8sTotalResourcesCardProps> = ({
  totalResources,
  datacenterCount,
  controllerTooltip,
  loadBalancerTooltip,
}) => {
  const totalDisk =
    totalResources.totalSystemStorage +
    totalResources.totalDataStorage +
    totalResources.totalSanStorage;

  return (
    <Card bordered size="sm" className="bg-secondary">
      <CardHeader>
        <CardTitle as="h6" className="text-sm text-secondary">
          {translate('Total cluster resources')}
        </CardTitle>
        <span className="text-xs font-normal text-tertiary">
          {translate('Datacenters: {count}', {
            count: formatUsageValue(datacenterCount, false),
          })}
        </span>
      </CardHeader>
      {/* Columns follow the card's width, not the viewport's: the card sits in
          a form column that is narrow on a phone and next to a sidebar on a
          desktop. */}
      <CardContent className="@container flex flex-col gap-5">
        <div className="grid gap-3 @sm:grid-cols-3">
          <StatCard
            size="sm"
            label={translate('Nodes')}
            value={<Figure value={totalResources.totalNodes} />}
          />
          <StatCard
            size="sm"
            label={translate('vCPUs')}
            value={
              <Figure
                value={totalResources.totalVCpus}
                unit={translate('cores')}
              />
            }
          />
          <StatCard
            size="sm"
            label={translate('Memory')}
            value={<Figure value={totalResources.totalRam} unit="GB" />}
          />
        </div>
        <div className="grid gap-x-10 gap-y-5 @xl:grid-cols-2">
          <Breakdown title={translate('Node roles')}>
            <PropertyList variant="compact">
              <PropertyItem
                label={translate('Controllers')}
                value={propVal.count(totalResources.totalControllerNodes)}
                tooltip={controllerTooltip}
              />
              <PropertyItem
                label={translate('Load balancers')}
                value={propVal.count(totalResources.totalLoadBalancerNodes)}
                tooltip={loadBalancerTooltip}
              />
              <PropertyItem
                label={translate('Workers')}
                value={propVal.count(totalResources.totalWorkerNodes)}
              />
              <PropertyItem
                label={translate('Storage nodes')}
                value={propVal.count(totalResources.totalStorageNodes)}
              />
            </PropertyList>
          </Breakdown>
          <Breakdown title={translate('Disks')}>
            <PropertyList variant="compact">
              <PropertyItem
                label={translate('System')}
                value={propVal.count(totalResources.totalSystemStorage, {
                  unit: 'GB',
                })}
              />
              {/* The controllers' etcd disks and the load balancers' log disks
                are counted here, with the node groups' data disks
                (multi-datacenter-k8s-types.ts). */}
              <PropertyItem
                label={translate('Data, etcd and logs')}
                value={propVal.count(totalResources.totalDataStorage, {
                  unit: 'GB',
                })}
              />
              <PropertyItem
                label={translate('SAN')}
                value={propVal.count(totalResources.totalSanStorage, {
                  unit: 'GB',
                })}
              />
              <PropertyItem
                label={translate('Total')}
                value={propVal.count(totalDisk, { unit: 'GB' })}
                valueClass="font-semibold"
              />
            </PropertyList>
          </Breakdown>
        </div>
      </CardContent>
    </Card>
  );
};
