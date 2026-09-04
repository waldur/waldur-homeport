import { AskUserFormBlock } from '@/ai-assistant/components/blocks/AskUserFormBlock';
import { CodeBlock } from '@/ai-assistant/components/blocks/CodeBlock';
import { HomePortNavBlock } from '@/ai-assistant/components/blocks/HomePortNavBlock';
import { MarkdownBlock } from '@/ai-assistant/components/blocks/MarkdownBlock';
import { ResourceListBlock } from '@/ai-assistant/components/blocks/ResourceListBlock';
import { ToolLoadingBlock } from '@/ai-assistant/components/blocks/ToolLoadingBlock';
import { VMOrderBlock } from '@/ai-assistant/components/blocks/VMOrderBlock';
import { UIBlockProps } from '@/ai-assistant/lib/types';
import { lazyOnce } from '@/core/lazyOnce';

import { uiRegistry } from './uiRegistry';

// mermaid initialises itself at import time and is only needed once a diagram
// block actually streams in, so the block is resolved on first render.
const MermaidBlock = lazyOnce<UIBlockProps>(() =>
  import('@/ai-assistant/components/blocks/MermaidBlock').then((module) => ({
    default: module.MermaidBlock,
  })),
);

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

uiRegistry.register({
  key: 'ask_user_form',
  component: AskUserFormBlock,
});
