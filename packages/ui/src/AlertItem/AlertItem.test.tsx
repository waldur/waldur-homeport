import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { AlertItem } from './AlertItem';

describe('AlertItem', () => {
  it('renders title, body, titleAfter, and actions correctly', () => {
    render(
      <AlertItem
        title="Alert title"
        titleAfter={<span data-testid="title-after">Badge</span>}
        body="Alert body description"
        actions={<button data-testid="action-btn">Action</button>}
        data-testid="alert-item"
      />,
    );

    expect(screen.getByText('Alert title')).toBeInTheDocument();
    expect(screen.getByTestId('title-after')).toBeInTheDocument();
    expect(screen.getByText('Alert body description')).toBeInTheDocument();
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(<AlertItem ref={ref} title="Title" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders with default variant="info" and type="full-width"', () => {
    render(<AlertItem title="Info alert" data-testid="alert-item" />);
    const el = screen.getByTestId('alert-item');
    expect(el).toHaveClass('py-[1.23rem]', 'border-b');

    const icon = screen.getByTestId('alert-featured-icon');
    expect(icon).toHaveAttribute('data-variant', 'neutral');
  });

  it('renders warning variant with warning icon variant', () => {
    render(
      <AlertItem
        title="Warning alert"
        variant="warning"
        data-testid="alert-item"
      />,
    );
    const icon = screen.getByTestId('alert-featured-icon');
    expect(icon).toHaveAttribute('data-variant', 'warning');
  });

  it('renders error variant with danger icon variant', () => {
    render(
      <AlertItem
        title="Error alert"
        variant="error"
        data-testid="alert-item"
      />,
    );
    const icon = screen.getByTestId('alert-featured-icon');
    expect(icon).toHaveAttribute('data-variant', 'danger');
  });

  describe('centered', () => {
    it('mirrors the icon with a hidden spacer so the text centres on the box', () => {
      render(
        <AlertItem
          title="Centred alert"
          variant="error"
          iconSize="sm"
          centered
          data-testid="alert-item"
        />,
      );
      const el = screen.getByTestId('alert-item');
      expect(el).toHaveClass('text-center');

      const spacer = screen.getByTestId('alert-icon-spacer');
      expect(spacer).toHaveAttribute('aria-hidden', 'true');
      expect(spacer).toHaveClass('invisible');
      // The test id stays unique to the visible icon.
      const icons = screen.getAllByTestId('alert-featured-icon');
      expect(icons).toHaveLength(1);
      const mirror = within(spacer).getByTestId('alert-icon-mirror');
      expect(mirror.style.width).not.toBe('');
      expect(mirror.style.width).toBe(icons[0].style.width);
    });

    it('skips the spacer when actions take the right side', () => {
      render(
        <AlertItem
          title="Centred alert"
          centered
          actions={<button>Go</button>}
        />,
      );
      expect(screen.queryByTestId('alert-icon-spacer')).not.toBeInTheDocument();
    });

    it('renders no spacer by default', () => {
      render(<AlertItem title="Plain alert" data-testid="alert-item" />);
      expect(screen.queryByTestId('alert-icon-spacer')).not.toBeInTheDocument();
      expect(screen.getByTestId('alert-item')).not.toHaveClass('text-center');
    });
  });

  it('renders type="floating" with full border and rounded styling', () => {
    render(
      <AlertItem
        title="Floating alert"
        type="floating"
        data-testid="alert-item"
      />,
    );
    const el = screen.getByTestId('alert-item');
    expect(el).toHaveClass('p-[1.23rem]', 'rounded-[0.475rem]', 'border');
  });
});
