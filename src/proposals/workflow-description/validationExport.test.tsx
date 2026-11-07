import { render, screen } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Call } from '@/proposals/types';

import {
  useValidationExport,
  useValidationTableExport,
  ValidationExportProvider,
} from './validationExport';

const call = { uuid: 'c1', url: 'https://example.com/calls/c1/' } as Call;

const Panel: FC<{ children?: ReactNode }> = ({ children }) => {
  const { button, slot } = useValidationExport(call);
  return (
    <>
      <header data-testid="header">{button}</header>
      <ValidationExportProvider value={slot}>
        {children}
      </ValidationExportProvider>
    </>
  );
};

let seen: ReturnType<typeof useValidationTableExport>;
const TableStub = () => {
  seen = useValidationTableExport();
  return null;
};

describe('validation export', () => {
  it('offers the report alone when the panel has no table', () => {
    render(<Panel />);
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it("gives way to the table's Export, which offers the report too", () => {
    render(
      <Panel>
        <TableStub />
      </Panel>,
    );
    expect(
      screen.queryByRole('button', { name: 'Export' }),
    ).not.toBeInTheDocument();
    expect(seen.enableExport).toBe(true);
    expect(seen.fullExport.format).toBe('pdf');
    expect(screen.getByTestId('header')).toContainElement(seen.portal.toolbar);
  });

  it('adds nothing to a table outside a validation panel', () => {
    render(<TableStub />);
    expect(seen).toEqual({});
  });
});
