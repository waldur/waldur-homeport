import type {
  TopologyEdge,
  TopologyEdgeKind,
  TopologyGraph,
  TopologyNode,
  TopologyNodeType,
} from './types';

/**
 * Translate the topology graph into a Mermaid `flowchart LR` source string,
 * rendered by `<MermaidChart>` (Waldur's theme-aware wrapper).
 *
 * Returns both the diagram source and a tooltip map keyed by the
 * sanitised node id. The tooltip map is applied by TenantTopologyTab
 * as SVG <title> children once mermaid has rendered the diagram —
 * mermaid's own `click ... "tooltip"` directive is stripped by the
 * shared MermaidChart's `securityLevel: 'strict'` setting.
 *
 * Design notes:
 * - Mermaid IDs must be safe identifiers; we map `tenant:<uuid>` → `tenant_<uuid>`.
 * - Each node type has a distinct shape and classDef.
 * - Subnets with more than INSTANCE_THRESHOLD instance ports are
 *   collapsed into a single "N instances" aggregate node to keep the
 *   diagram readable and within mermaid's character budget.
 */

const INSTANCE_THRESHOLD = 8;

const sanitize = (id: string): string => id.replace(/[^a-zA-Z0-9_]/g, '_');

const escapeLabel = (label: string): string =>
  label
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '#quot;')
    .replace(/\n/g, ' ')
    .slice(0, 60);

const shape = (n: AggregateNode | TopologyNode): string => {
  const label = `"${escapeLabel(displayLabel(n))}"`;
  switch (n.type) {
    case 'tenant':
      return `((${label}))`;
    case 'router':
      return `{${label}}`;
    case 'network':
      return `[${label}]`;
    case 'subnet':
      return `[/${label}/]`;
    case 'port':
      return `(${label})`;
    case 'instance':
      return `[[${label}]]`;
    case 'floating_ip':
      return `>${label}]`;
    case 'external_network':
      return `{{${label}}}`;
    case 'rbac_share':
      return `[\\${label}\\]`;
    case 'aggregate_instances':
      return `[[${label}]]`;
    default:
      return `[${label}]`;
  }
};

interface AggregateNode {
  id: string;
  type: 'aggregate_instances';
  name: string;
  count: number;
}

const displayLabel = (n: AggregateNode | TopologyNode): string => {
  if (n.type === 'aggregate_instances') {
    return `${n.count} instances`;
  }
  if (n.type === 'floating_ip') {
    const addr = n.attrs.address as string | undefined;
    return addr || n.name;
  }
  if (n.type === 'port') {
    const fixed = n.attrs.fixed_ips as
      Array<{ ip_address?: string }> | undefined;
    if (fixed?.length && fixed[0].ip_address) {
      return fixed[0].ip_address;
    }
  }
  if (n.type === 'subnet') {
    const cidr = n.attrs.cidr as string | undefined;
    return cidr ? `${n.name} (${cidr})` : n.name;
  }
  if (n.type === 'rbac_share') {
    const src = n.attrs.source_tenant_name as string | undefined;
    return src ? `${n.name} ← ${src}` : n.name;
  }
  return n.name;
};

const tooltipFor = (n: AggregateNode | TopologyNode): string => {
  const lines: string[] = [];
  if (n.type === 'aggregate_instances') {
    lines.push(`${n.count} instances`);
    lines.push('(collapsed for readability — open the Instances tab)');
    return lines.join('\n');
  }
  lines.push(`${labelTypeTag(n.type)}: ${n.name}`);
  const a = n.attrs;
  const push = (k: string, v: unknown) => {
    if (v === null || v === undefined || v === '' || v === false) return;
    if (Array.isArray(v) && v.length === 0) return;
    let formatted: string;
    if (Array.isArray(v) || typeof v === 'object') {
      try {
        formatted = JSON.stringify(v);
      } catch {
        formatted = String(v);
      }
    } else {
      formatted = String(v);
    }
    lines.push(`${k}: ${formatted}`);
  };

  switch (n.type) {
    case 'tenant':
      push('backend ID', a.backend_id);
      break;
    case 'router':
      push('backend ID', a.backend_id);
      push('has external gateway', a.has_external_gateway);
      push('SNAT enabled', a.enable_snat);
      push('external fixed IPs', a.external_fixed_ips);
      break;
    case 'network':
      push('is external', a.is_external);
      push('MTU', a.mtu);
      push('type', a.type);
      push('backend ID', a.backend_id);
      break;
    case 'subnet':
      push('CIDR', a.cidr);
      push('gateway IP', a.gateway_ip);
      push('IP version', a.ip_version);
      push('is connected', a.is_connected);
      push('backend ID', a.backend_id);
      break;
    case 'port':
      push('MAC address', a.mac_address);
      push('fixed IPs', a.fixed_ips);
      push('backend ID', a.backend_id);
      break;
    case 'instance':
      push('runtime state', a.runtime_state);
      push('state', a.state);
      push('flavor', a.flavor_name);
      push('backend ID', a.backend_id);
      break;
    case 'floating_ip':
      push('address', a.address);
      push('external address', a.external_address);
      push('runtime state', a.runtime_state);
      push('backend network', a.backend_network_id);
      break;
    case 'external_network':
      push('shared', a.is_shared);
      push('default', a.is_default);
      push('backend ID', a.backend_id);
      break;
    case 'rbac_share':
      push('policy type', a.policy_type);
      push('source tenant', a.source_tenant_name);
      push('source network UUID', a.source_network_uuid);
      push('backend ID', a.backend_id);
      break;
  }
  return lines.join('\n');
};

const labelTypeTag = (type: TopologyNodeType): string => {
  switch (type) {
    case 'tenant':
      return 'Tenant';
    case 'router':
      return 'Router';
    case 'network':
      return 'Network';
    case 'subnet':
      return 'Subnet';
    case 'port':
      return 'Port';
    case 'instance':
      return 'Instance';
    case 'floating_ip':
      return 'Floating IP';
    case 'external_network':
      return 'External network';
    case 'rbac_share':
      return 'RBAC share';
    default:
      return type;
  }
};

const edgeStyle = (kind: TopologyEdgeKind): string => {
  switch (kind) {
    case 'contains':
      return '-..->';
    case 'gateway':
      return '==>';
    case 'shared_with':
    case 'floating_for':
      return '-.->';
    case 'attached_to':
    case 'has_interface':
    case 'has_subnet':
    case 'has_port':
      return '-->';
    default:
      return '-->';
  }
};

const classFor = (type: TopologyNodeType | 'aggregate_instances'): string =>
  type === 'aggregate_instances' ? 'node_instance' : `node_${type}`;

const CLASS_DEFS = `
classDef node_tenant fill:#0a3500,stroke:#3a8c00,color:#f5f5f6,stroke-width:2px
classDef node_router fill:#1f5000,stroke:#3a8c00,color:#f5f5f6
classDef node_network fill:#26384d,stroke:#5078a8,color:#f5f5f6
classDef node_subnet fill:#1f3a4a,stroke:#5078a8,color:#f5f5f6
classDef node_port fill:#2e2f33,stroke:#85888e,color:#f5f5f6
classDef node_instance fill:#1f3a26,stroke:#3a8c00,color:#f5f5f6
classDef node_floating_ip fill:#3a2f1f,stroke:#a87a3a,color:#f5f5f6
classDef node_external_network fill:#3a1f1f,stroke:#a83a3a,color:#f5f5f6
classDef node_rbac_share fill:#3a1f3a,stroke:#a83aa8,color:#f5f5f6
`.trim();

const aggregateLargeSubnets = (
  graph: TopologyGraph,
): {
  nodes: Array<TopologyNode | AggregateNode>;
  edges: Array<{ source: string; target: string; kind: TopologyEdgeKind }>;
} => {
  const nodesById = new Map<string, TopologyNode>();
  for (const n of graph.nodes) nodesById.set(n.id, n);

  const subnetInstancePorts = new Map<string, string[]>();
  const portToInstance = new Map<string, string>();
  const routerHasInterfacePort = new Set<string>();

  for (const e of graph.edges) {
    if (e.kind === 'has_interface') routerHasInterfacePort.add(e.target);
  }
  for (const e of graph.edges) {
    if (e.kind === 'attached_to') {
      const port = nodesById.get(e.source);
      const instance = nodesById.get(e.target);
      if (port?.type === 'port' && instance?.type === 'instance') {
        portToInstance.set(port.id, instance.id);
      }
    }
  }
  for (const e of graph.edges) {
    if (e.kind === 'has_port') {
      const subnet = nodesById.get(e.source);
      const port = nodesById.get(e.target);
      if (!subnet || !port) continue;
      if (portToInstance.has(port.id)) {
        if (!subnetInstancePorts.has(subnet.id))
          subnetInstancePorts.set(subnet.id, []);
        subnetInstancePorts.get(subnet.id)!.push(port.id);
      }
    }
  }

  const dropNodes = new Set<string>();
  const aggregateNodes: AggregateNode[] = [];
  const aggregateEdges: Array<{
    source: string;
    target: string;
    kind: TopologyEdgeKind;
  }> = [];

  for (const [subnetId, portIds] of subnetInstancePorts.entries()) {
    if (portIds.length <= INSTANCE_THRESHOLD) continue;
    const instanceIds = portIds
      .map((p) => portToInstance.get(p))
      .filter((id): id is string => Boolean(id));
    const aggId = `aggregate_instances:${subnetId}`;
    aggregateNodes.push({
      id: aggId,
      type: 'aggregate_instances',
      name: 'instances',
      count: instanceIds.length,
    });
    aggregateEdges.push({
      source: subnetId,
      target: aggId,
      kind: 'has_port',
    });
    for (const p of portIds) dropNodes.add(p);
    for (const i of instanceIds) dropNodes.add(i);
  }

  const filteredEdges = graph.edges
    .filter((e) => !dropNodes.has(e.source) && !dropNodes.has(e.target))
    .concat(aggregateEdges);

  const filteredNodes: Array<TopologyNode | AggregateNode> = [
    ...graph.nodes.filter((n) => !dropNodes.has(n.id)),
    ...aggregateNodes,
  ];

  return { nodes: filteredNodes, edges: filteredEdges };
};

export type LegendEdgeStyle = 'plain' | 'dotted' | 'thick';

const edgeStyleCategory = (kind: TopologyEdgeKind): LegendEdgeStyle => {
  switch (kind) {
    case 'gateway':
      return 'thick';
    case 'contains':
    case 'shared_with':
    case 'floating_for':
      return 'dotted';
    default:
      return 'plain';
  }
};

interface MermaidTopologyOutput {
  code: string;
  tooltips: Record<string, string>;
  /** Node types present in the rendered diagram (after aggregation). */
  presentNodeTypes: Set<TopologyNodeType>;
  /** Edge styles actually emitted in the rendered diagram. */
  presentEdgeStyles: Set<LegendEdgeStyle>;
}

export const buildTopologyMermaidCode = (
  graph: TopologyGraph,
): MermaidTopologyOutput => {
  if (graph.nodes.length === 0) {
    return {
      code: 'flowchart LR\n  empty["No resources to display"]',
      tooltips: {},
      presentNodeTypes: new Set(),
      presentEdgeStyles: new Set(),
    };
  }

  const { nodes, edges } = aggregateLargeSubnets(graph);
  const lines: string[] = ['flowchart LR'];
  const tooltips: Record<string, string> = {};
  const presentNodeTypes = new Set<TopologyNodeType>();
  const presentEdgeStyles = new Set<LegendEdgeStyle>();

  const sanitizedById = new Map<string, string>();
  for (const node of nodes) {
    const safeId = sanitize(node.id);
    sanitizedById.set(node.id, safeId);
    lines.push(`  ${safeId}${shape(node)}`);
    lines.push(`  class ${safeId} ${classFor(node.type)}`);
    tooltips[safeId] = tooltipFor(node);
    if (node.type === 'aggregate_instances') {
      presentNodeTypes.add('instance');
    } else {
      presentNodeTypes.add(node.type);
    }
  }

  for (const edge of edges as TopologyEdge[]) {
    const src = sanitizedById.get(edge.source);
    const dst = sanitizedById.get(edge.target);
    if (!src || !dst) continue;
    lines.push(`  ${src} ${edgeStyle(edge.kind)} ${dst}`);
    presentEdgeStyles.add(edgeStyleCategory(edge.kind));
  }

  lines.push(CLASS_DEFS);
  return {
    code: lines.join('\n'),
    tooltips,
    presentNodeTypes,
    presentEdgeStyles,
  };
};
