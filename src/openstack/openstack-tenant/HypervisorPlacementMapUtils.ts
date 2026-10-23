import { PlacementInstance } from './HypervisorPlacementMapTypes';

interface ServerGroupInfo {
  name: string;
  policy: string;
  memberCount: number;
}

/** Convert MiB to a human-readable string (e.g. "8 GB") */
export const formatRam = (ramMiB: number): string => {
  if (ramMiB >= 1024) {
    const gb = ramMiB / 1024;
    return Number.isInteger(gb) ? `${gb} GB` : `${gb.toFixed(1)} GB`;
  }
  return `${ramMiB} MB`;
};

const getHypervisorKey = (instance: PlacementInstance): string =>
  instance.hypervisor_hostname?.trim() || 'Unassigned';

/** Group instances by hypervisor hostname, sorted alphabetically (Unassigned last) */
export const groupByHypervisor = (
  instances: PlacementInstance[],
): { hostname: string; instances: PlacementInstance[] }[] => {
  const byHypervisor = new Map<string, PlacementInstance[]>();
  for (const inst of instances) {
    const key = getHypervisorKey(inst);
    if (!byHypervisor.has(key)) byHypervisor.set(key, []);
    byHypervisor.get(key).push(inst);
  }

  return [...byHypervisor.entries()]
    .sort(([a], [b]) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    })
    .map(([hostname, insts]) => ({ hostname, instances: insts }));
};

/** Extract server group legend data from instances */
export const buildServerGroupLegend = (
  instances: PlacementInstance[],
): ServerGroupInfo[] => {
  const groups = new Map<string, ServerGroupInfo>();
  for (const inst of instances) {
    const sg = inst.server_group;
    if (!sg?.name) continue;
    if (groups.has(sg.name)) {
      groups.get(sg.name).memberCount++;
    } else {
      groups.set(sg.name, {
        name: sg.name,
        policy: sg.policy || '?',
        memberCount: 1,
      });
    }
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
};
