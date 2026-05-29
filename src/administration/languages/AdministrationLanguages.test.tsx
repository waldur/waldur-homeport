import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettings } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { AdministrationLanguages } from './AdministrationLanguages';

describe('AdministrationLanguages', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES = ['en', 'et'];
    ENV.defaultLanguage = 'en';
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ];
    vi.clearAllMocks();
  });

  it('renders all language options', () => {
    render(<AdministrationLanguages />);
    ENV.languageChoices.forEach((lang) => {
      expect(screen.getByText(lang.label)).toBeInTheDocument();
    });
  });

  it('prevents unselecting current language', async () => {
    render(<AdministrationLanguages />);
    const currentLangCheckbox = screen.getByTestId('language_en');

    await userEvent.click(currentLangCheckbox);

    expect(currentLangCheckbox).toBeChecked();
  });

  it('successfully saves language choices', async () => {
    const saveConfigMock = vi.mocked(overrideSettings).mockResolvedValue(null);
    const { getByText } = render(<AdministrationLanguages />);

    await userEvent.click(getByText('Save'));

    expect(saveConfigMock).toHaveBeenCalledWith({
      body: {
        LANGUAGE_CHOICES: 'en,et',
      },
    });
  });
});
