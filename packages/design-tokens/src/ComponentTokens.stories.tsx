import type { Meta, StoryObj } from '@storybook/react-vite';

import themeCss from './css/tailwind/theme.css?raw';
import { parseTokenFile, utilitiesByToken } from './stories/tokenSource';
import { TokenPage, TokenTable } from './stories/TokenTable';

const meta: Meta = {
  title: 'Foundations/Component Tokens',
  parameters: {
    docs: {
      description: {
        component:
          "The tokens scoped to one waldur-ui component family (components/*.css), read from the stylesheets. Each points at a semantic role, so the component follows the theme without a dark-mode block of its own; the sidebar's columns are its styles, chosen by data-sidebar-style. A component reads these as arbitrary values (`bg-[var(--btn-primary-bg)]`), not utilities.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const files = import.meta.glob<string>('./css/components/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const utilities = utilitiesByToken(themeCss);

const page = (name: string, title: string): Story => ({
  name: title,
  render: () => {
    const file = parseTokenFile(files[`./css/components/${name}.css`]);
    return (
      <TokenPage title={title} intro={file.doc}>
        <TokenTable file={file} utilities={utilities} />
      </TokenPage>
    );
  },
});

export const Button = page('button', 'Button');
export const Card = page('card', 'Card');
export const Check = page('check', 'Checkbox, radio, switch');
export const Dialog = page('dialog', 'Dialog');
export const Menu = page('menu', 'Menu');
export const Progress = page('progress', 'Progress');
export const Sheet = page('sheet', 'Sheet');
export const Sidebar = page('sidebar', 'Sidebar');
export const Tab = page('tab', 'Tabs');
export const Table = page('table', 'Table');
