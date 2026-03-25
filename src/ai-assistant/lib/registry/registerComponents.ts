import { CodeBlock } from '@waldur/ai-assistant/components/blocks/CodeBlock';
import { MarkdownBlock } from '@waldur/ai-assistant/components/blocks/MarkdownBlock';
import { MermaidBlock } from '@waldur/ai-assistant/components/blocks/MermaidBlock';
import { TableBlock } from '@waldur/ai-assistant/components/blocks/TableBlock';
import { ToolLoadingBlock } from '@waldur/ai-assistant/components/blocks/ToolLoadingBlock';
import { VMOrderBlock } from '@waldur/ai-assistant/components/blocks/VMOrderBlock';

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

uiRegistry.register({
  key: 'table',
  component: TableBlock,
});

uiRegistry.register({
  key: 'tool',
  component: ToolLoadingBlock,
});

uiRegistry.register({
  key: 'vm_order',
  component: VMOrderBlock,
});
