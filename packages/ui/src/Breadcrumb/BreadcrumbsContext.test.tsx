import { act, render, screen } from '@testing-library/react';
import { FC, useMemo, useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  BreadcrumbsProvider,
  IBreadcrumbItem,
  useBreadcrumbs,
} from './BreadcrumbsContext';
import { BreadcrumbTrail } from './BreadcrumbTrail';

const Page: FC<{ text: string }> = ({ text }) => {
  const items = useMemo<IBreadcrumbItem[]>(
    () => [
      { key: 'projects', text: 'Projects', to: 'projects' },
      { key: 'page', text, active: true },
    ],
    [text],
  );
  useBreadcrumbs(items);
  return null;
};

let showPage: (show: boolean) => void;

const App = () => {
  const [show, setShow] = useState(true);
  showPage = setShow;
  return (
    <BreadcrumbsProvider
      renderLink={(to) => (
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a href={`#/${to}`} />
      )}
    >
      <BreadcrumbTrail />
      {show && <Page text="Project Alpha" />}
    </BreadcrumbsProvider>
  );
};

describe('BreadcrumbsProvider', () => {
  it("shows the crumbs a page sets, linked through the provider's renderLink", () => {
    render(<App />);

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '#/projects',
    );
  });

  it('clears the trail when the page unmounts', () => {
    render(<App />);

    act(() => showPage(false));

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('lets a page set crumbs without a provider', () => {
    expect(() => render(<Page text="Project Alpha" />)).not.toThrow();
  });
});
