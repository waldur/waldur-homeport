import { FC } from 'react';

import { translate } from '@/i18n';

import type { LegendEdgeStyle } from './buildMermaidCode';
import type { TopologyNodeType } from './types';

interface Props {
  /** Node types to render in the legend. Undefined means "show all". */
  nodeTypes?: Set<TopologyNodeType>;
  /** Edge styles to render in the legend. Undefined means "show all". */
  edgeStyles?: Set<LegendEdgeStyle>;
}

type ShapeKind =
  | 'circle'
  | 'rhombus'
  | 'rectangle'
  | 'parallelogram'
  | 'rounded'
  | 'subroutine'
  | 'asymmetric'
  | 'hexagon'
  | 'back-parallelogram';

interface LegendItem {
  type: TopologyNodeType;
  shape: ShapeKind;
  fill: string;
  stroke: string;
  label: string;
  description: string;
}

const useItems = (): LegendItem[] => [
  {
    type: 'tenant',
    shape: 'circle',
    fill: '#0a3500',
    stroke: '#3a8c00',
    label: translate('Tenant'),
    description: translate(
      'Your OpenStack project — the scope that owns all the networks, routers, and instances below.',
    ),
  },
  {
    type: 'router',
    shape: 'rhombus',
    fill: '#1f5000',
    stroke: '#3a8c00',
    label: translate('Router'),
    description: translate(
      'A virtual L3 router that connects internal subnets to each other and to the external network.',
    ),
  },
  {
    type: 'network',
    shape: 'rectangle',
    fill: '#26384d',
    stroke: '#5078a8',
    label: translate('Network'),
    description: translate(
      'A private network owned by the tenant; carries one or more subnets.',
    ),
  },
  {
    type: 'subnet',
    shape: 'parallelogram',
    fill: '#1f3a4a',
    stroke: '#5078a8',
    label: translate('Subnet'),
    description: translate(
      'An IPv4/IPv6 subnet with its own CIDR, gateway, and DHCP range.',
    ),
  },
  {
    type: 'port',
    shape: 'rounded',
    fill: '#2e2f33',
    stroke: '#85888e',
    label: translate('Port'),
    description: translate(
      'A network port — either an interface on a router or a NIC attached to an instance.',
    ),
  },
  {
    type: 'instance',
    shape: 'subroutine',
    fill: '#1f3a26',
    stroke: '#3a8c00',
    label: translate('Instance'),
    description: translate('A virtual machine running in this tenant.'),
  },
  {
    type: 'floating_ip',
    shape: 'asymmetric',
    fill: '#3a2f1f',
    stroke: '#a87a3a',
    label: translate('Floating IP'),
    description: translate(
      'A reserved external IP allocated to the tenant; can be attached to a port to expose an instance.',
    ),
  },
  {
    type: 'external_network',
    shape: 'hexagon',
    fill: '#3a1f1f',
    stroke: '#a83a3a',
    label: translate('External network'),
    description: translate(
      'A provider-level network used as the tenant’s upstream gateway; supplies floating IPs.',
    ),
  },
  {
    type: 'rbac_share',
    shape: 'back-parallelogram',
    fill: '#3a1f3a',
    stroke: '#a83aa8',
    label: translate('RBAC share'),
    description: translate(
      'A network shared into this tenant from another tenant via a Neutron RBAC policy.',
    ),
  },
];

const useEdgeItems = () => [
  {
    kind: 'plain',
    label: translate('Plain arrow'),
    description: translate(
      'Structural attachment (interface, port, instance NIC).',
    ),
  },
  {
    kind: 'dotted',
    label: translate('Dotted arrow'),
    description: translate(
      'Containment or a logical association (floating-IP, RBAC share).',
    ),
  },
  {
    kind: 'thick',
    label: translate('Thick arrow'),
    description: translate('Upstream / gateway connection.'),
  },
];

const ShapeSwatch: FC<{ kind: ShapeKind; fill: string; stroke: string }> = ({
  kind,
  fill,
  stroke,
}) => {
  const common = {
    fill,
    stroke,
    strokeWidth: 2,
  } as const;
  switch (kind) {
    case 'circle':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <circle cx={18} cy={13} r={11} {...common} />
        </svg>
      );
    case 'rhombus':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <polygon points="18,2 34,13 18,24 2,13" {...common} />
        </svg>
      );
    case 'rectangle':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <rect x={3} y={4} width={30} height={18} {...common} />
        </svg>
      );
    case 'parallelogram':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <polygon points="8,4 33,4 28,22 3,22" {...common} />
        </svg>
      );
    case 'rounded':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <rect x={3} y={4} width={30} height={18} rx={9} ry={9} {...common} />
        </svg>
      );
    case 'subroutine':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <rect x={3} y={4} width={30} height={18} {...common} />
          <line x1={8} y1={4} x2={8} y2={22} stroke={stroke} strokeWidth={2} />
          <line
            x1={28}
            y1={4}
            x2={28}
            y2={22}
            stroke={stroke}
            strokeWidth={2}
          />
        </svg>
      );
    case 'asymmetric':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <polygon points="3,4 28,4 34,13 28,22 3,22" {...common} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <polygon points="9,4 27,4 33,13 27,22 9,22 3,13" {...common} />
        </svg>
      );
    case 'back-parallelogram':
      return (
        <svg width={36} height={26} viewBox="0 0 36 26" aria-hidden>
          <polygon points="3,4 28,4 33,22 8,22" {...common} />
        </svg>
      );
    default:
      return null;
  }
};

const EdgeSwatch: FC<{ kind: string }> = ({ kind }) => {
  const stroke = '#85888e';
  if (kind === 'dotted') {
    return (
      <svg width={36} height={12} viewBox="0 0 36 12" aria-hidden>
        <line
          x1={2}
          y1={6}
          x2={28}
          y2={6}
          stroke={stroke}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <polygon points="28,2 34,6 28,10" fill={stroke} />
      </svg>
    );
  }
  if (kind === 'thick') {
    return (
      <svg width={36} height={12} viewBox="0 0 36 12" aria-hidden>
        <line x1={2} y1={6} x2={28} y2={6} stroke={stroke} strokeWidth={3} />
        <polygon points="28,1 34,6 28,11" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg width={36} height={12} viewBox="0 0 36 12" aria-hidden>
      <line x1={2} y1={6} x2={28} y2={6} stroke={stroke} strokeWidth={1.5} />
      <polygon points="28,2 34,6 28,10" fill={stroke} />
    </svg>
  );
};

export const TopologyLegend: FC<Props> = ({ nodeTypes, edgeStyles }) => {
  const items = useItems().filter(
    (item) => !nodeTypes || nodeTypes.has(item.type),
  );
  const edgeItems = useEdgeItems().filter(
    (item) => !edgeStyles || edgeStyles.has(item.kind as LegendEdgeStyle),
  );

  if (items.length === 0 && edgeItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {items.length > 0 ? (
        <>
          <h6 className="text-muted text-uppercase fs-7 fw-bold mb-3">
            {translate('Legend')}
          </h6>
          <div className="row g-3">
            {items.map((item) => (
              <div key={item.type} className="col-12 col-md-6 col-xl-4">
                <div className="d-flex gap-3 align-items-start">
                  <div className="flex-shrink-0">
                    <ShapeSwatch
                      kind={item.shape}
                      fill={item.fill}
                      stroke={item.stroke}
                    />
                  </div>
                  <div className="small">
                    <div className="fw-bold">{item.label}</div>
                    <div className="text-muted">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {edgeItems.length > 0 ? (
        <>
          <h6 className="text-muted text-uppercase fs-7 fw-bold mt-4 mb-3">
            {translate('Edges')}
          </h6>
          <div className="row g-3">
            {edgeItems.map((item) => (
              <div key={item.kind} className="col-12 col-md-4">
                <div className="d-flex gap-3 align-items-center">
                  <EdgeSwatch kind={item.kind} />
                  <div className="small">
                    <div className="fw-bold">{item.label}</div>
                    <div className="text-muted">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};
