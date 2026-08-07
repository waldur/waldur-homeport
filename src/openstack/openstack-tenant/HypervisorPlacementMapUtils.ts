import { PlacementInstance } from './HypervisorPlacementMapTypes';

interface ServerGroupInfo {
  name: string;
  policy: string;
  memberCount: number;
}

/** Strip non-alphanumeric chars to produce a valid Mermaid ID */
export const sanitizeId = (input: string): string =>
  input.replace(/[^a-zA-Z0-9]/g, '');

/**
 * Sanitize text for Mermaid architecture-beta labels.
 * Only alphanumeric characters and spaces are safe — dashes, dots,
 * commas, brackets, backslashes and other punctuation break the parser.
 */
export const escapeLabel = (text: string): string =>
  text
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/  +/g, ' ')
    .trim();

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

const getServerGroupKey = (instance: PlacementInstance): string | null =>
  instance.server_group?.name || null;

/**
 * Generate a Mermaid architecture-beta diagram showing VMs grouped by
 * hypervisor and optionally nested by server group.
 */
export const generatePlacementDiagram = (
  instances: PlacementInstance[],
): string => {
  // Group instances by hypervisor
  const byHypervisor = new Map<string, PlacementInstance[]>();
  for (const inst of instances) {
    const key = getHypervisorKey(inst);
    if (!byHypervisor.has(key)) byHypervisor.set(key, []);
    byHypervisor.get(key).push(inst);
  }

  // Sort hypervisors alphabetically, "Unassigned" last
  const sortedKeys = [...byHypervisor.keys()].sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  const lines: string[] = ['architecture-beta'];

  for (const hvName of sortedKeys) {
    const hvId = 'hv' + sanitizeId(hvName);
    const hvIcon = hvName === 'Unassigned' ? 'ph:question' : 'ph:cpu';
    lines.push(`    group ${hvId}(${hvIcon})[${escapeLabel(hvName)}]`);

    const hvInstances = byHypervisor.get(hvName);

    // Sub-group by server group within this hypervisor
    const byServerGroup = new Map<string, PlacementInstance[]>();
    const ungrouped: PlacementInstance[] = [];

    for (const inst of hvInstances) {
      const sgName = getServerGroupKey(inst);
      if (sgName) {
        if (!byServerGroup.has(sgName)) byServerGroup.set(sgName, []);
        byServerGroup.get(sgName).push(inst);
      } else {
        ungrouped.push(inst);
      }
    }

    // Emit server group sub-groups
    for (const [sgName, sgInstances] of byServerGroup) {
      const sgId = 'sg' + sanitizeId(sgName) + sanitizeId(hvName);
      const policy = sgInstances[0]?.server_group?.policy || '?';
      lines.push(
        `    group ${sgId}(ph:users-three)[${escapeLabel(sgName)} ${escapeLabel(policy)}] in ${hvId}`,
      );
      for (const inst of sgInstances) {
        const vmId = 'vm' + sanitizeId(inst.uuid);
        const vmLabel = buildVmLabel(inst);
        lines.push(
          `        service ${vmId}(ph:desktop-tower)[${vmLabel}] in ${sgId}`,
        );
      }
    }

    // Emit ungrouped VMs directly under hypervisor
    for (const inst of ungrouped) {
      const vmId = 'vm' + sanitizeId(inst.uuid);
      const vmLabel = buildVmLabel(inst);
      lines.push(
        `        service ${vmId}(ph:desktop-tower)[${vmLabel}] in ${hvId}`,
      );
    }
  }

  return lines.join('\n');
};

const buildVmLabel = (inst: PlacementInstance): string => {
  const name = escapeLabel(inst.name || 'unnamed');
  const cores = inst.cores != null ? `${inst.cores} vCPU` : '? vCPU';
  const ram = inst.ram != null ? formatRam(inst.ram) : '? RAM';
  return `${name} ${cores} ${ram}`;
};

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
