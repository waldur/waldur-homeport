import { FC } from 'react';

import { UIBlockProps } from '@waldur/ai-assistant/lib/types';

interface UIComponent {
  key: string;
  component: FC<UIBlockProps>;
}

class UIComponentRegistry {
  private components = new Map<string, UIComponent>();

  register(config: UIComponent): void {
    this.components.set(config.key, config);
  }

  get(key: string): UIComponent | undefined {
    return this.components.get(key);
  }

  getComponent(key: string): FC<UIBlockProps> {
    const component = this.components.get(key);
    if (!component) {
      // Fallback to Markdown for unknown types
      const markdownComponent = this.components.get('markdown');
      if (markdownComponent) {
        return markdownComponent.component;
      }
      // Ultimate fallback: render nothing
      return () => null;
    }
    return component.component;
  }
}

export const uiRegistry = new UIComponentRegistry();
