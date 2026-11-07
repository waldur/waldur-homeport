import { CpuIcon, QuestionIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { FC, Fragment, useMemo } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { PlacementInstance } from './HypervisorPlacementMapTypes';
import { formatRam, groupByHypervisor } from './HypervisorPlacementMapUtils';

interface Props {
  instances: PlacementInstance[];
}

/** Sub-group instances within a hypervisor by server group (keyed by URL for uniqueness) */
const splitByServerGroup = (
  instances: PlacementInstance[],
): {
  serverGroups: {
    key: string;
    name: string;
    policy: string;
    instances: PlacementInstance[];
  }[];
  ungrouped: PlacementInstance[];
} => {
  const sgMap = new Map<
    string,
    {
      key: string;
      name: string;
      policy: string;
      instances: PlacementInstance[];
    }
  >();
  const ungrouped: PlacementInstance[] = [];

  for (const inst of instances) {
    const sg = inst.server_group;
    if (sg?.name) {
      // Use URL as key since server group names are not unique across tenants
      const key = sg.url || sg.name;
      if (!sgMap.has(key)) {
        sgMap.set(key, {
          key,
          name: sg.name,
          policy: sg.policy || '?',
          instances: [],
        });
      }
      sgMap.get(key).instances.push(inst);
    } else {
      ungrouped.push(inst);
    }
  }

  return {
    serverGroups: [...sgMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    ungrouped,
  };
};

const InstanceRow: FC<{
  inst: PlacementInstance;
  indent?: boolean;
}> = ({ inst, indent }) => (
  <TableRow>
    <TableCell className={indent ? 'ps-6' : 'ps-3'}>{inst.name}</TableCell>
    <TableCell>{renderFieldOrDash(inst.cores)}</TableCell>
    <TableCell>{inst.ram != null ? formatRam(inst.ram) : '\u2014'}</TableCell>
    <TableCell>{renderFieldOrDash(inst.customer_name)}</TableCell>
    <TableCell>{renderFieldOrDash(inst.project_name)}</TableCell>
    <TableCell className="pe-3">
      {renderFieldOrDash(inst.offering_name)}
    </TableCell>
  </TableRow>
);

export const HypervisorPlacementMapContent: FC<Props> = ({ instances }) => {
  const groups = useMemo(() => groupByHypervisor(instances), [instances]);

  return (
    <div
      className="flex flex-col gap-3"
      style={{ overflow: 'auto', maxHeight: '70vh' }}
    >
      {groups.map((group) => {
        const totalCores = group.instances.reduce(
          (sum, i) => sum + (i.cores || 0),
          0,
        );
        const totalRam = group.instances.reduce(
          (sum, i) => sum + (i.ram || 0),
          0,
        );
        const isUnassigned = group.hostname === 'Unassigned';
        const { serverGroups, ungrouped } = splitByServerGroup(group.instances);
        const hasAnyServerGroups = serverGroups.length > 0;

        return (
          <div
            key={group.hostname}
            className="border border-secondary rounded-lg"
          >
            {/* Hypervisor header */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-b-secondary bg-brand-subtle">
              {isUnassigned ? (
                <QuestionIcon className="text-warning" weight="bold" />
              ) : (
                <CpuIcon className="text-brand" weight="bold" />
              )}
              <span className="font-medium">{group.hostname}</span>
              <span className="text-quaternary ms-auto text-xs">
                {group.instances.length === 1
                  ? translate('1 VM')
                  : translate('{count} VMs', {
                      count: group.instances.length,
                    })}
                {' \u00b7 '}
                {totalCores} vCPU{' \u00b7 '}
                {formatRam(totalRam)}
              </span>
            </div>

            {/* Table of instances */}
            <Table density="compact" className="align-middle text-xs mb-0">
              <TableHeader>
                <TableRow className="text-quaternary font-medium text-xs uppercase">
                  <TableHead className="ps-3">
                    {translate('Instance')}
                  </TableHead>
                  <TableHead>{translate('vCPU')}</TableHead>
                  <TableHead>{translate('RAM')}</TableHead>
                  <TableHead>{translate('Organization')}</TableHead>
                  <TableHead>{translate('Project')}</TableHead>
                  <TableHead className="pe-3">{translate('Tenant')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Server-grouped instances */}
                {serverGroups.map((sg) => (
                  <Fragment key={sg.key}>
                    <TableRow hoverable={false}>
                      <TableCell
                        colSpan={6}
                        className="ps-3 py-1.5 bg-info-subtle"
                      >
                        <UsersThreeIcon
                          className="text-info me-1.5"
                          weight="bold"
                          size={16}
                        />
                        <span className="font-medium text-info text-xs">
                          {sg.name}
                        </span>
                        <span className="text-quaternary text-xs ms-1.5">
                          {sg.policy}
                        </span>
                      </TableCell>
                    </TableRow>
                    {sg.instances.map((inst) => (
                      <InstanceRow
                        key={inst.uuid}
                        inst={inst}
                        indent={hasAnyServerGroups}
                      />
                    ))}
                  </Fragment>
                ))}

                {/* Ungrouped instances */}
                {ungrouped.length > 0 && hasAnyServerGroups && (
                  <TableRow hoverable={false}>
                    <TableCell
                      colSpan={6}
                      className="ps-3 py-1.5 bg-tertiary dark:bg-quaternary"
                    >
                      <span className="text-quaternary text-xs font-medium">
                        {translate('No server group')}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                {ungrouped.map((inst) => (
                  <InstanceRow
                    key={inst.uuid}
                    inst={inst}
                    indent={hasAnyServerGroups}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};
