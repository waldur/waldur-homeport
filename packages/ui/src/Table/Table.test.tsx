import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

describe('Table primitive', () => {
  it('renders table elements with default (normal) density', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Header')).toHaveClass('py-2.5', 'px-3');
    expect(screen.getByText('Content')).toHaveClass('py-2.5', 'px-3');
  });

  it('renders compact density classes', () => {
    render(
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Header')).toHaveClass(
      'py-1.5',
      'px-2.5',
      'text-xs',
    );
    expect(screen.getByText('Content')).toHaveClass(
      'py-1.5',
      'px-2.5',
      'text-xs',
    );
  });

  it('renders spacious density classes', () => {
    render(
      <Table density="spacious">
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Header')).toHaveClass('py-3.5', 'px-4');
    expect(screen.getByText('Content')).toHaveClass('py-3.5', 'px-4');
  });
});
