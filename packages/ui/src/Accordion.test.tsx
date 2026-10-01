import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

const renderAccordion = (defaultValue?: string) =>
  render(
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      <AccordionItem value="offering">
        <AccordionTrigger>Offering</AccordionTrigger>
        <AccordionContent>Offering body</AccordionContent>
      </AccordionItem>
      <AccordionItem value="state">
        <AccordionTrigger>State</AccordionTrigger>
        <AccordionContent>State body</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

describe('Accordion', () => {
  it('renders each trigger as a button inside a heading', () => {
    renderAccordion();

    const trigger = screen.getByRole('button', { name: 'Offering' });
    expect(
      screen.getByRole('heading', { level: 3, name: 'Offering' }),
    ).toContainElement(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a panel on click and links it to its trigger', async () => {
    renderAccordion();

    const trigger = screen.getByRole('button', { name: 'Offering' });
    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-state', 'open');
    const panel = screen.getByRole('region', { name: 'Offering' });
    expect(panel).toHaveTextContent('Offering body');
    expect(panel).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
  });

  it('unmounts a closed panel', async () => {
    renderAccordion('offering');

    expect(screen.getByText('Offering body')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Offering' }));
    expect(screen.queryByText('Offering body')).not.toBeInTheDocument();
  });

  it('keeps one panel open at a time in single mode', async () => {
    renderAccordion('offering');

    await userEvent.click(screen.getByRole('button', { name: 'State' }));

    expect(screen.queryByText('Offering body')).not.toBeInTheDocument();
    expect(screen.getByText('State body')).toBeInTheDocument();
  });

  it('keeps several panels open in multiple mode', async () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="offering">
          <AccordionTrigger>Offering</AccordionTrigger>
          <AccordionContent>Offering body</AccordionContent>
        </AccordionItem>
        <AccordionItem value="state">
          <AccordionTrigger>State</AccordionTrigger>
          <AccordionContent>State body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Offering' }));
    await userEvent.click(screen.getByRole('button', { name: 'State' }));

    expect(screen.getByText('Offering body')).toBeInTheDocument();
    expect(screen.getByText('State body')).toBeInTheDocument();
  });

  it('moves focus between headers with the arrow keys', async () => {
    renderAccordion();

    screen.getByRole('button', { name: 'Offering' }).focus();
    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', { name: 'State' })).toHaveFocus();
  });

  it('colours the open header with the runtime brand token', () => {
    renderAccordion();

    const trigger = screen.getByRole('button', { name: 'Offering' });
    expect(trigger).toHaveClass('data-[state=open]:text-brand-700');
    expect(trigger).toHaveClass('dark:data-[state=open]:text-brand-200');
  });

  // A select that auto-focuses while its panel is still sliding open (and
  // clipping) makes the browser scroll the panel; it must snap back.
  it('undoes any scroll of a panel', async () => {
    renderAccordion();

    await userEvent.click(screen.getByRole('button', { name: 'Offering' }));
    const panel = screen.getByRole('region', { name: 'Offering' });
    panel.scrollTop = 26;
    fireEvent.scroll(panel);

    expect(panel.scrollTop).toBe(0);
  });
});
