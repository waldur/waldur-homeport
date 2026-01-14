import { CodeBlock } from '@waldur/ai-assistant/components/blocks/CodeBlock';
import { MarkdownBlock } from '@waldur/ai-assistant/components/blocks/MarkdownBlock';
import { MermaidBlock } from '@waldur/ai-assistant/components/blocks/MermaidBlock';

import { uiRegistry } from './uiRegistry';

uiRegistry.register({
  key: 'markdown',
  component: MarkdownBlock,
});

uiRegistry.register({
  key: 'code',
  component: CodeBlock,
});

uiRegistry.register({
  key: 'mermaid',
  component: MermaidBlock,
});
