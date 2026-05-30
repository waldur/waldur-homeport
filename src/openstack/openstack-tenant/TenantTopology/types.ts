export type TopologyNodeType =
  | 'tenant'
  | 'router'
  | 'network'
  | 'subnet'
  | 'port'
  | 'instance'
  | 'floating_ip'
  | 'external_network'
  | 'rbac_share';

export type TopologyEdgeKind =
  | 'contains'
  | 'has_subnet'
  | 'has_port'
  | 'has_interface'
  | 'attached_to'
  | 'gateway'
  | 'floating_for'
  | 'shared_with';

export interface TopologyNode {
  id: string;
  type: TopologyNodeType;
  name: string;
  uuid: string | null;
  attrs: Record<string, unknown>;
}

export interface TopologyEdge {
  source: string;
  target: string;
  kind: TopologyEdgeKind;
}

export interface TopologyGraph {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}
