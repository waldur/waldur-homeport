import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConditionalCascadeField } from './ConditionalCascadeField';

describe('ConditionalCascadeField', () => {
  const mockOnChange = vi.fn();

  const getFieldConfig = () => ({
    type: 'conditional_cascade',
    label: 'Cascade Label',
    cascade_config: {
      steps: [
        {
          name: 'step1',
          label: 'Step 1',
          type: 'select_string',
          choices: [
            { value: 'v1', label: 'Value 1' },
            { value: 'v2', label: 'Value 2' },
          ],
        },
        {
          name: 'step2',
          label: 'Step 2',
          type: 'select_string',
          depends_on: 'step1',
          choices_map: {
            v1: [{ value: 'v1-a', label: 'Value 1-A' }],
            v2: [{ value: 'v2-a', label: 'Value 2-A' }],
          },
        },
        {
          name: 'step3',
          label: 'Step 3',
          type: 'select_string',
          depends_on: 'step2',
          choices_map: {
            'v1-a': [{ value: 'final', label: 'Final Value' }],
          },
        },
      ],
    },
  });

  const renderComponent = (value = {}) => {
    return render(
      <ConditionalCascadeField
        field={getFieldConfig()}
        input={{ name: 'cascade', value, onChange: mockOnChange } as any}
        tooltip="Test Tooltip"
      />,
    );
  };

  it('renders correctly and respects dependencies', async () => {
    renderComponent();

    expect(screen.getByText('Test Tooltip')).toBeInTheDocument();

    // Check labels
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();

    // Only the first step is enabled, so only one combobox is available
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    const step1Input = screen.getAllByRole('combobox')[0];

    // Select value in Step 1
    await userEvent.click(step1Input);
    await userEvent.click(screen.getByText('Value 1'));

    // Verify onChange was called
    expect(mockOnChange).toHaveBeenCalledWith({ step1: 'v1' });

    // Step 2 should now be enabled
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    const step2Input = screen.getAllByRole('combobox')[1];

    // Select value in Step 2
    await userEvent.click(step2Input);
    await userEvent.click(screen.getByText('Value 1-A'));

    expect(mockOnChange).toHaveBeenCalledWith({ step1: 'v1', step2: 'v1-a' });

    // Step 3 should now be enabled
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    const step3Input = screen.getAllByRole('combobox')[2];

    // Select value in Step 3
    await userEvent.click(step3Input);
    await userEvent.click(screen.getByText('Final Value'));

    expect(mockOnChange).toHaveBeenCalledWith({
      step1: 'v1',
      step2: 'v1-a',
      step3: 'final',
    });
  });

  it('clears dependent fields when parent changes', async () => {
    renderComponent({ step1: 'v1', step2: 'v1-a', step3: 'final' });

    // Everything is enabled because initial values satisfy dependencies
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes).toHaveLength(3);
    const step1Input = comboboxes[0];

    // Change step 1 to a different value
    await userEvent.click(step1Input);
    await userEvent.click(screen.getByText('Value 2'));

    // Should clear step 2 and step 3
    expect(mockOnChange).toHaveBeenCalledWith({ step1: 'v2' });
  });
});
