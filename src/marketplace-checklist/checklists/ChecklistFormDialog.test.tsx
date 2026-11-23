import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel } from '@/test/select';

import { ChecklistFormDialog } from './ChecklistFormDialog';

vi.mock('@/marketplace/utils', () => ({
  isExperimentalUiComponentsVisible: vi.fn(),
}));

const openTypeOptions = async (experimental: boolean) => {
  vi.mocked(isExperimentalUiComponentsVisible).mockReturnValue(experimental);
  const user = userEvent.setup();
  renderWithProviders(<ChecklistFormDialog resolve={{ refetch: vi.fn() }} />);
  await user.click(
    within(getSelectByLabel('Checklist type')).getByRole('combobox'),
  );
  return (await screen.findAllByRole('option')).map((o) => o.textContent);
};

describe('ChecklistFormDialog', () => {
  // Feedback checklists are authored through the survey wizard, which owns
  // their questions; one made here would have no survey to belong to.
  it.each([true, false])(
    'offers no feedback survey type (experimental UI: %s)',
    async (experimental) => {
      const options = await openTypeOptions(experimental);

      expect(options).toContain('Project metadata');
      expect(options).not.toContain('Feedback survey');
    },
  );
});
