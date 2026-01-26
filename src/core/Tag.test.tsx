import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Tag } from './Tag';

describe('Tag', () => {
  it('renders children correctly', () => {
    render(<Tag>Test Tag</Tag>);

    expect(screen.getByText('Test Tag')).toBeInTheDocument();
  });

  it('applies the tag class', () => {
    render(<Tag>Test Tag</Tag>);

    const tagElement = screen.getByText('Test Tag');
    expect(tagElement).toHaveClass('tag');
  });

  it('applies size class when size prop is provided', () => {
    render(<Tag size="sm">Small Tag</Tag>);

    const tagElement = screen.getByText('Small Tag');
    expect(tagElement).toHaveClass('tag-sm');
  });

  it('applies lg size class', () => {
    render(<Tag size="lg">Large Tag</Tag>);

    const tagElement = screen.getByText('Large Tag');
    expect(tagElement).toHaveClass('tag-lg');
  });

  it('applies custom className', () => {
    render(<Tag className="custom-class">Custom Tag</Tag>);

    const tagElement = screen.getByText('Custom Tag');
    expect(tagElement).toHaveClass('custom-class');
  });

  it('renders clear button when onClear is provided', () => {
    const onClear = vi.fn();
    render(<Tag onClear={onClear}>Clearable Tag</Tag>);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    render(<Tag onClear={onClear}>Clearable Tag</Tag>);

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });

  it('does not render clear button when onClear is not provided', () => {
    render(<Tag>No Clear Tag</Tag>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('forwards ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Tag ref={ref}>Ref Tag</Tag>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toContain('Ref Tag');
  });

  it('ref element has correct class', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag ref={ref} size="sm" className="extra">
        Ref Tag
      </Tag>,
    );

    expect(ref.current).toHaveClass('tag');
    expect(ref.current).toHaveClass('tag-sm');
    expect(ref.current).toHaveClass('extra');
  });
});
