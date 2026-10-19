import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders standard breadcrumb structure with proper accessibility roles', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/organizations">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Project Alpha</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav).toBeInTheDocument();

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');

    const activePage = screen.getByText('Project Alpha');
    expect(activePage).toHaveAttribute('aria-current', 'page');
    // The current page is not a link, disabled or otherwise.
    expect(
      screen.queryByRole('link', { name: 'Project Alpha' }),
    ).not.toBeInTheDocument();
  });

  it('renders custom separator when provided', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="custom-sep">
            <span>&gt;</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByTestId('custom-sep')).toHaveTextContent('>');
  });

  it('renders ellipsis component with visually hidden text', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis data-testid="ellipsis" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    // Only the icon is hidden, so the visually hidden label is announced.
    expect(screen.getByTestId('ellipsis')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('More')).toHaveClass('sr-only');
  });

  it('announces a custom ellipsis label', () => {
    render(<BreadcrumbEllipsis label="Hidden crumbs" />);

    expect(screen.getByText('Hidden crumbs')).toHaveClass('sr-only');
  });

  it('supports compound component syntax', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/test">Test</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Active</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>,
    );

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test' })).toHaveAttribute(
      'href',
      '/test',
    );
    expect(screen.getByText('Active')).toHaveAttribute('aria-current', 'page');
  });
});
