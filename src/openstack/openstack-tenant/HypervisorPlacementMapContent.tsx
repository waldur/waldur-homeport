import { CpuIcon, QuestionIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { formatRam, groupByHypervisor } from './HypervisorPlacementMapUtils';

export interface PlacementInstance extends OpenStackInstance {
  /** Offering name from the marketplace Resource (used as "Tenant" label) */
  offering_name?: string;
}

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
  <tr>
    <td className={indent ? 'ps-8 fw-semibold' : 'ps-4 fw-semibold'}>
      {inst.name}
    </td>
    <td>{renderFieldOrDash(inst.cores)}</td>
    <td>{inst.ram != null ? formatRam(inst.ram) : '\u2014'}</td>
    <td>{renderFieldOrDash(inst.customer_name)}</td>
    <td>{renderFieldOrDash(inst.project_name)}</td>
    <td className="pe-4">{renderFieldOrDash(inst.offering_name)}</td>
  </tr>
);

export const HypervisorPlacementMapContent: FC<Props> = ({ instances }) => {
  const groups = useMemo(() => groupByHypervisor(instances), [instances]);

  return (
    <div
      className="d-flex flex-column gap-4"
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
          <div key={group.hostname} className="border rounded">
            {/* Hypervisor header */}
            <div className="d-flex align-items-center gap-2 px-4 py-3 border-bottom bg-light-primary">
              {isUnassigned ? (
                <QuestionIcon className="text-warning" weight="bold" />
              ) : (
                <CpuIcon className="text-primary" weight="bold" />
              )}
              <span className="fw-bold">{group.hostname}</span>
              <span className="text-muted ms-auto fs-7">
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
            <div className="table-responsive">
              <table className="table table-row-bordered align-middle fs-7 mb-0">
                <thead>
                  <tr className="text-muted fw-bold fs-8 text-uppercase">
                    <th className="ps-4">{translate('Instance')}</th>
                    <th>{translate('vCPU')}</th>
                    <th>{translate('RAM')}</th>
                    <th>{translate('Organization')}</th>
                    <th>{translate('Project')}</th>
                    <th className="pe-4">{translate('Tenant')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Server-grouped instances */}
                  {serverGroups.map((sg) => (
                    <>
                      <tr key={sg.key}>
                        <td colSpan={6} className="ps-4 py-2 bg-light-info">
                          <UsersThreeIcon
                            className="text-info me-2"
                            weight="bold"
                            size={16}
                          />
                          <span className="fw-bold text-info fs-8">
                            {sg.name}
                          </span>
                          <span className="text-muted fs-8 ms-2">
                            {sg.policy}
                          </span>
                        </td>
                      </tr>
                      {sg.instances.map((inst) => (
                        <InstanceRow
                          key={inst.uuid}
                          inst={inst}
                          indent={hasAnyServerGroups}
                        />
                      ))}
                    </>
                  ))}

                  {/* Ungrouped instances */}
                  {ungrouped.length > 0 && hasAnyServerGroups && (
                    <tr>
                      <td colSpan={6} className="ps-4 py-2 bg-light">
                        <span className="text-muted fs-8 fw-bold">
                          {translate('No server group')}
                        </span>
                      </td>
                    </tr>
                  )}
                  {ungrouped.map((inst) => (
                    <InstanceRow
                      key={inst.uuid}
                      inst={inst}
                      indent={hasAnyServerGroups}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
