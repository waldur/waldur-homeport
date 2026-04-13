import { CodeBlock } from '@waldur/ai-assistant/components/blocks/CodeBlock';
import { HomePortNavBlock } from '@waldur/ai-assistant/components/blocks/HomePortNavBlock';
import { MarkdownBlock } from '@waldur/ai-assistant/components/blocks/MarkdownBlock';
import { MermaidBlock } from '@waldur/ai-assistant/components/blocks/MermaidBlock';
import { ResourceListBlock } from '@waldur/ai-assistant/components/blocks/ResourceListBlock';
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
  key: 'tool',
  component: ToolLoadingBlock,
});

uiRegistry.register({
  key: 'vm_order',
  component: VMOrderBlock,
});

uiRegistry.register({
  key: 'homeport_nav',
  component: HomePortNavBlock,
});

uiRegistry.register({
  key: 'resource_list',
  component: ResourceListBlock,
});
