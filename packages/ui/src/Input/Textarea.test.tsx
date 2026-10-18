import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea and forwards its ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Notes" rows={4} />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(ref.current).toBe(textarea);
  });

  it('reports typing', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'ab');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('maps invalid to aria-invalid', () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('resizes vertically unless the caller fixes it', () => {
    const { rerender } = render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-y');
    rerender(<Textarea aria-label="Notes" className="resize-none" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-none');
    expect(screen.getByRole('textbox')).not.toHaveClass('resize-y');
  });
});
