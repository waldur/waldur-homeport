import { describe, expect, it } from 'vitest';

import { buildTopologyMermaidCode } from './buildMermaidCode';
import { buildClassDefs, NODE_PALETTE } from './nodePalette';

// The classDef block as it was written by hand before the palette existed.
const PREVIOUS_CLASS_DEFS = `classDef node_tenant fill:#0a3500,stroke:#3a8c00,color:#f5f5f6,stroke-width:2px
classDef node_router fill:#1f5000,stroke:#3a8c00,color:#f5f5f6
classDef node_network fill:#26384d,stroke:#5078a8,color:#f5f5f6
classDef node_subnet fill:#1f3a4a,stroke:#5078a8,color:#f5f5f6
classDef node_port fill:#2e2f33,stroke:#85888e,color:#f5f5f6
classDef node_instance fill:#1f3a26,stroke:#3a8c00,color:#f5f5f6
classDef node_floating_ip fill:#3a2f1f,stroke:#a87a3a,color:#f5f5f6
classDef node_external_network fill:#3a1f1f,stroke:#a83a3a,color:#f5f5f6
classDef node_rbac_share fill:#3a1f3a,stroke:#a83aa8,color:#f5f5f6`;

describe('node palette', () => {
  it('generates the same classDef block as the hand-written one', () => {
    expect(buildClassDefs()).toBe(PREVIOUS_CLASS_DEFS);
  });

  it('is what the diagram source ends with', () => {
    const { code } = buildTopologyMermaidCode({
      nodes: [
        { id: 'tenant:1', type: 'tenant', name: 't', uuid: null, attrs: {} },
      ],
      edges: [],
    });
    expect(code.endsWith(buildClassDefs())).toBe(true);
  });

  it('has a fill and a stroke for every node type', () => {
    for (const [type, { fill, stroke }] of Object.entries(NODE_PALETTE)) {
      expect(fill, type).toMatch(/^#[0-9a-f]{6}$/);
      expect(stroke, type).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
