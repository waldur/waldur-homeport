import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BaseButton } from './BaseButton';
import { LanguageMenu, LanguageOption } from './LanguageMenu';
import { Menu } from './Menu';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'et', label: 'Eesti' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

const meta: Meta<typeof LanguageMenu> = {
  title: 'Navigation/LanguageMenu',
  component: LanguageMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Language switcher submenu component inside a Menu, with country flags and radio selection semantics.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LanguageMenu>;

export const Default: Story = {
  render: () => {
    const [current, setCurrent] = useState<LanguageOption>(LANGUAGES[0]);
    return (
      <div className="p-12">
        <Menu>
          <Menu.Trigger asChild>
            <BaseButton variant="secondary" label="Preferences" />
          </Menu.Trigger>
          <Menu.Content className="py-[12px] text-[14px] font-medium w-56">
            <LanguageMenu
              currentLanguage={current}
              languageChoices={LANGUAGES}
              onLanguageChange={setCurrent}
            />
          </Menu.Content>
        </Menu>
      </div>
    );
  },
};
