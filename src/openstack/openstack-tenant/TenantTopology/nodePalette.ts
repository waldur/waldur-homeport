import type { TopologyNodeType } from './types';

/**
 * Fill and stroke of each node type, shared by the diagram (Mermaid `classDef`
 * lines, see buildClassDefs) and by TopologyLegend's swatches, so the legend
 * cannot drift from what is drawn.
 *
 * These are a palette of their own, not theme tokens: dark fills with light
 * text whatever the theme, in a hue per kind of resource. Only the router fill
 * and the port stroke happen to equal a token step (brand-800, gray-dark-500),
 * so they are not read from one: a tenant's brand colour must not recolour one
 * node type and leave the others.
 */
export const NODE_PALETTE: Record<
  TopologyNodeType,
  { fill: string; stroke: string }
> = {
  tenant: { fill: '#0a3500', stroke: '#3a8c00' },
  router: { fill: '#1f5000', stroke: '#3a8c00' },
  network: { fill: '#26384d', stroke: '#5078a8' },
  subnet: { fill: '#1f3a4a', stroke: '#5078a8' },
  port: { fill: '#2e2f33', stroke: '#85888e' },
  instance: { fill: '#1f3a26', stroke: '#3a8c00' },
  floating_ip: { fill: '#3a2f1f', stroke: '#a87a3a' },
  external_network: { fill: '#3a1f1f', stroke: '#a83a3a' },
  rbac_share: { fill: '#3a1f3a', stroke: '#a83aa8' },
};

/** Label colour on every node fill. */
const NODE_TEXT_COLOR = '#f5f5f6';

/** Line colour of the legend's edge samples. */
export const LEGEND_EDGE_STROKE = '#85888e';

/** The Mermaid `classDef` block for every node type. */
export const buildClassDefs = (): string =>
  (
    Object.entries(NODE_PALETTE) as [
      TopologyNodeType,
      { fill: string; stroke: string },
    ][]
  )
    .map(
      ([type, { fill, stroke }]) =>
        `classDef node_${type} fill:${fill},stroke:${stroke},color:${NODE_TEXT_COLOR}${
          type === 'tenant' ? ',stroke-width:2px' : ''
        }`,
    )
    .join('\n');
