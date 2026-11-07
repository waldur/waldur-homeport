import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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

  it('renders bare table without outer wrapper when scrollable is false', () => {
    render(
      <Table scrollable={false} data-testid="bare-table">
        <TableBody>
          <TableRow>
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByTestId('bare-table');
    expect(table.tagName).toBe('TABLE');
  });

  it('renders TableFooter and TableCaption', () => {
    render(
      <Table>
        <TableCaption>Summary Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="table-footer">
          <TableRow>
            <TableCell>Total: 100</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByText('Summary Caption')).toHaveClass('text-sm');
    expect(screen.getByTestId('table-footer')).toHaveClass('border-t');
  });

  it('respects hoverable=false and divided=false on TableRow', () => {
    render(
      <Table>
        <TableBody>
          <TableRow hoverable={false} divided={false} data-testid="plain-row">
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const row = screen.getByTestId('plain-row');
    expect(row.className).not.toContain('hover:bg');
    expect(row.className).not.toContain('border-b');
  });

  it('applies striped class when striped is true', () => {
    render(
      <Table striped data-testid="striped-table">
        <TableBody>
          <TableRow>
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByTestId('striped-table');
    expect(table.className).toContain('[&_tbody_tr:nth-child(even)]:bg-');
  });
});
