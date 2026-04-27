import { CodeBlock } from '@/ai-assistant/components/blocks/CodeBlock';
import { HomePortNavBlock } from '@/ai-assistant/components/blocks/HomePortNavBlock';
import { MarkdownBlock } from '@/ai-assistant/components/blocks/MarkdownBlock';
import { MermaidBlock } from '@/ai-assistant/components/blocks/MermaidBlock';
import { ResourceListBlock } from '@/ai-assistant/components/blocks/ResourceListBlock';
import { ToolLoadingBlock } from '@/ai-assistant/components/blocks/ToolLoadingBlock';
import { VMOrderBlock } from '@/ai-assistant/components/blocks/VMOrderBlock';

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
