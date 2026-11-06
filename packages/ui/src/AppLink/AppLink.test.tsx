import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BreadcrumbsProvider } from '../Breadcrumb';
import { StatCard } from '../StatCard';

import { AppLink, LinkProvider } from './AppLink';

// Stands in for an app's router link: it marks what it drew, so a test can
// tell the renderer was used and that the content and props were filled in.
const renderTestLink = (to: string, params?: object) => (
  // A renderer returns its link empty; AppLink fills it in.
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <a href={`/app/${to}`} data-params={JSON.stringify(params ?? {})} />
);

describe('AppLink', () => {
  it('is a plain href without a LinkProvider', () => {
    render(<AppLink to="/projects">Projects</AppLink>);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  it("draws the provider's link, filled with its content and props", () => {
    render(
      <LinkProvider renderLink={renderTestLink}>
        <AppLink to="projects" params={{ id: 1 }} className="x" id="l">
          Projects
        </AppLink>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', { name: 'Projects' });
    expect(link).toHaveAttribute('href', '/app/projects');
    expect(link).toHaveAttribute('data-params', '{"id":1}');
    expect(link).toHaveClass('x');
    expect(link).toHaveAttribute('id', 'l');
  });

  it('keeps an outer LinkProvider when BreadcrumbsProvider has no renderLink', () => {
    render(
      <LinkProvider renderLink={renderTestLink}>
        <BreadcrumbsProvider>
          <AppLink to="projects">Projects</AppLink>
        </BreadcrumbsProvider>
      </LinkProvider>,
    );
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/app/projects',
    );
  });
});

describe('StatCard link', () => {
  it('reads "View all" plus the tile label, and goes through the provider', () => {
    render(
      <LinkProvider renderLink={renderTestLink}>
        <StatCard label="Organizations" value={42} link={{ to: 'orgs' }} />
      </LinkProvider>,
    );
    expect(
      screen.getByRole('link', { name: 'View all Organizations' }),
    ).toHaveAttribute('href', '/app/orgs');
  });

  it('takes its own text', () => {
    render(
      <StatCard
        label="Pending reviews"
        value={3}
        footer="since Monday"
        link={{ to: '#reviews', label: 'Review now' }}
      />,
    );
    expect(
      screen.getByRole('link', { name: 'Review now Pending reviews' }),
    ).toBeInTheDocument();
    expect(screen.getByText('since Monday')).toBeInTheDocument();
  });
});
