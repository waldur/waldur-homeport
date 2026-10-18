import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettings } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useUser } from '@/workspace/hooks';

import { AdministrationLanguages } from './AdministrationLanguages';

describe('AdministrationLanguages', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
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

  it('flags each English variant and leaves an unmapped language without a flag', () => {
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'en-gb', label: 'English (UK)' },
      { code: 'xx', label: 'Unmapped' },
    ];
    render(<AdministrationLanguages />);

    // In render order: English, English (UK); the unmapped language has none.
    // A language code is not a country code, so no bogus flag-xx sprite.
    const flags = screen.getAllByTestId('country-flag');
    expect(flags).toHaveLength(2);
    expect(flags[0]).toHaveClass('flag-us');
    expect(flags[1]).toHaveClass('flag-gb');
  });

  it('prevents unselecting current language', async () => {
    render(<AdministrationLanguages />);
    const currentLangCheckbox = screen.getByTestId('language_en');

    await userEvent.click(currentLangCheckbox);

    expect(currentLangCheckbox).toBeChecked();
  });

  it('shows the current choices without edit controls for support', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: true,
    } as any);
    render(<AdministrationLanguages />);

    expect(
      screen.queryByRole('button', { name: /Save/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('language_en')).not.toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getAllByText('Yes')).toHaveLength(2);
  });

  it('successfully saves language choices', async () => {
    const saveConfigMock = vi.mocked(overrideSettings).mockResolvedValue(null);
    render(<AdministrationLanguages />);

    await userEvent.click(screen.getByText('Save'));

    expect(saveConfigMock).toHaveBeenCalledWith({
      body: {
        LANGUAGE_CHOICES: 'en,et',
      },
    });
  });
});
