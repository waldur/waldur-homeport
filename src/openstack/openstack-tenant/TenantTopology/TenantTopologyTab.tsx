import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { openstackTenantsTopologyRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { MermaidChart } from '@/core/MermaidChart';
import { translate } from '@/i18n';

import { buildTopologyMermaidCode } from './buildMermaidCode';
import { TopologyExport } from './TopologyExport';
import { TopologyLegend } from './TopologyLegend';
import type { TopologyGraph } from './types';

interface Props {
  resource?: { slug?: string };
  resourceScope: { uuid: string };
}

// `YYYY-MM-DD_HH-MM-SS` in local time — sorts chronologically and is safe
// on every filesystem (no colons, no spaces).
const fileTimestamp = (d = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const applyTooltips = (
  container: HTMLElement,
  tooltips: Record<string, string>,
): void => {
  // Mermaid prefixes the chart id (e.g. `mermaid--rN--<ts>`) then appends
  // `-flowchart-<safeId>-<index>` for each node group. We match on the
  // `-flowchart-<safeId>-<index>` suffix to recover our sanitized id.
  const nodes = container.querySelectorAll<SVGGElement>('g.node');
  nodes.forEach((node) => {
    const id = node.id || '';
    const match = /-flowchart-(.+?)-\d+$/.exec(id);
    if (!match) return;
    const tooltip = tooltips[match[1]];
    if (!tooltip) return;
    // Don't double-add the title across re-renders.
    if (node.querySelector(':scope > title')) return;
    const titleEl = document.createElementNS(SVG_NS, 'title');
    titleEl.textContent = tooltip;
    node.insertBefore(titleEl, node.firstChild);
    node.style.cursor = 'help';
  });
};

export const TenantTopologyTab: FC<Props> = ({ resource, resourceScope }) => {
  const { data, isLoading, isError, refetch } = useQuery<TopologyGraph>({
    queryKey: ['openstack-tenant-topology', resourceScope.uuid],
    queryFn: async () => {
      const response = await openstackTenantsTopologyRetrieve({
        path: { uuid: resourceScope.uuid },
      });
      return response.data as TopologyGraph;
    },
  });

  const built = useMemo(
    () => (data ? buildTopologyMermaidCode(data) : null),
    [data],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!built || !containerRef.current) return;
    const container = containerRef.current;

    // MermaidChart renders asynchronously; observe child mutations and
    // apply tooltips when the SVG appears. Re-runs on theme switches
    // (which cause mermaid to re-render) too.
    const observer = new MutationObserver(() => {
      applyTooltips(container, built.tooltips);
    });
    observer.observe(container, { childList: true, subtree: true });

    // Apply immediately in case the SVG is already there.
    applyTooltips(container, built.tooltips);

    return () => observer.disconnect();
  }, [built]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (isError || !built) {
    return <LoadingErred loadData={refetch} />;
  }

  const getSvg = (): SVGElement | null =>
    containerRef.current?.querySelector('svg') ?? null;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">{translate('Topology')}</Card.Title>
        <TopologyExport
          getSvg={getSvg}
          mermaidCode={built.code}
          filenameBase={`topology-${resource?.slug || resourceScope.uuid.slice(0, 8)}-${fileTimestamp()}`}
        />
      </Card.Header>
      <Card.Body>
        <div ref={containerRef}>
          <MermaidChart code={built.code} className="overflow-auto" />
        </div>
        <TopologyLegend
          nodeTypes={built.presentNodeTypes}
          edgeStyles={built.presentEdgeStyles}
        />
      </Card.Body>
    </Card>
  );
};
