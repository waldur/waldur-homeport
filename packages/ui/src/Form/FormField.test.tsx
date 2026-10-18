import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { DatePicker, MonthPicker } from '../DatePicker';
import { Input } from '../Input/Input';
import { NativeSelect } from '../Input/NativeSelect';
import { RangeInput } from '../Input/RangeInput';
import { Textarea } from '../Input/Textarea';
import { Select } from '../Select';

import { FieldScope, useFieldLabelFor } from './FieldScope';
import { FormField } from './FormField';
import { FormFieldset } from './FormFieldset';
import { FormHeading } from './FormHeading';
import { FormLabel } from './FormLabel';
import { FormLegend } from './FormLegend';
import { FormText } from './FormText';

describe('FormField', () => {
  it('points the label at the control through controlId', () => {
    render(
      <FormField controlId="name">
        <FormLabel>Name</FormLabel>
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name');
  });

  it.each([
    ['RangeInput', <RangeInput key="r" value={10} onChange={() => {}} />],
    ['Input', <Input key="i" />],
    ['Textarea', <Textarea key="t" />],
    [
      'NativeSelect',
      <NativeSelect key="s">
        <option>a</option>
      </NativeSelect>,
    ],
  ])('names a %s', (_name, control) => {
    render(
      <FormField controlId="field">
        <FormLabel>Field</FormLabel>
        {control}
      </FormField>,
    );
    expect(screen.getByLabelText('Field')).toHaveAttribute('id', 'field');
  });

  it("lets a control's own id win", () => {
    render(
      <FormField controlId="group">
        <FormLabel htmlFor="own">Own</FormLabel>
        <Input id="own" />
      </FormField>,
    );
    expect(screen.getByLabelText('Own')).toHaveAttribute('id', 'own');
  });

  it('links the label to its control with no controlId', () => {
    render(
      <FormField>
        <FormLabel>Auto</FormLabel>
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Auto');
    expect(input.id).not.toBe('');
  });

  it('gives every control its own id and points the label at the first', () => {
    render(
      <FormField>
        <FormLabel>Rows</FormLabel>
        <Input aria-label="first" />
        <Input aria-label="second" />
        <Textarea aria-label="third" />
      </FormField>,
    );
    const ids = ['first', 'second', 'third'].map(
      (name) => screen.getByLabelText(name).id,
    );
    expect(new Set(ids).size).toBe(3);
    expect(screen.getByLabelText('Rows')).toBe(screen.getByLabelText('first'));
  });

  it('shares an explicit controlId with every control, as asked', () => {
    render(
      <FormField controlId="shared">
        <FormLabel>Shared</FormLabel>
        <Input aria-label="a" />
        <Input aria-label="b" />
      </FormField>,
    );
    expect(screen.getByLabelText('a')).toHaveAttribute('id', 'shared');
    expect(screen.getByLabelText('b')).toHaveAttribute('id', 'shared');
  });

  it("points the label at a control's own id", () => {
    render(
      <FormField>
        <FormLabel>Own id</FormLabel>
        <Input id="mine" />
      </FormField>,
    );
    expect(screen.getByLabelText('Own id')).toHaveAttribute('id', 'mine');
  });

  it('leaves a control outside any field without an id', () => {
    render(<Input aria-label="loose" />);
    expect(screen.getByLabelText('loose')).not.toHaveAttribute('id');
  });

  it("points the label at a control's own id even when the field has a controlId", () => {
    render(
      <FormField controlId="group">
        <FormLabel>Own id wins</FormLabel>
        <Input id="mine" />
      </FormField>,
    );
    expect(screen.getByLabelText('Own id wins')).toHaveAttribute('id', 'mine');
  });

  it('draws another element when asked', () => {
    render(
      // eslint-disable-next-line waldur-custom/no-hand-rolled-table -- a td is the thing under test, not a data table
      <table>
        <tbody>
          <tr>
            <FormField as="td" controlId="cell">
              <Input aria-label="In a cell" />
            </FormField>
          </tr>
        </tbody>
      </table>,
    );

    expect(screen.getByLabelText('In a cell').parentElement?.tagName).toBe(
      'TD',
    );
  });
});

describe('FormField with pickers and Select', () => {
  it("points the label at a Select's own inputId", () => {
    render(
      <FormField>
        <FormLabel>Region</FormLabel>
        <Select inputId="region-input" options={[{ value: 'a', label: 'A' }]} />
      </FormField>,
    );
    expect(screen.getByLabelText('Region')).toHaveAttribute(
      'id',
      'region-input',
    );
  });

  it('names a Select through its input id', () => {
    render(
      <FormField controlId="plan">
        <FormLabel>Plan</FormLabel>
        <Select options={[{ value: 'a', label: 'A' }]} />
      </FormField>,
    );
    expect(screen.getByLabelText('Plan')).toHaveAttribute('id', 'plan');
  });

  it.each([
    ['DatePicker', <DatePicker key="d" value={null} onChange={() => {}} />],
    ['MonthPicker', <MonthPicker key="m" value={null} onChange={() => {}} />],
  ])('names a %s', (_name, picker) => {
    render(
      <FormField controlId="when">
        <FormLabel>When</FormLabel>
        {picker}
      </FormField>,
    );
    expect(screen.getByLabelText('When')).toHaveAttribute('id', 'when');
  });
});

describe('FormLabel', () => {
  it('marks a required field with an asterisk drawn by CSS, not text', () => {
    render(
      <FormField>
        <FormLabel required>Name</FormLabel>
      </FormField>,
    );
    const label = screen.getByText('Name');
    expect(label).toHaveClass("after:content-['*']");
    expect(label).toHaveTextContent(/^Name$/);
  });

  it('is a plain label otherwise', () => {
    render(
      <FormField>
        <FormLabel>Name</FormLabel>
      </FormField>,
    );
    expect(screen.getByText('Name')).not.toHaveClass("after:content-['*']");
  });

  it('keeps a caller class, replacing a conflicting default', () => {
    render(
      <FormField>
        <FormLabel className="mb-0">Name</FormLabel>
      </FormField>,
    );
    const label = screen.getByText('Name');
    expect(label).toHaveClass('mb-0');
    expect(label).not.toHaveClass('mb-[6.5px]');
  });
});

describe('FormText', () => {
  it('is a small element by default, and a div on request', () => {
    const { rerender } = render(<FormText>Help</FormText>);
    expect(screen.getByText('Help').tagName).toBe('SMALL');
    rerender(<FormText as="div">Help</FormText>);
    expect(screen.getByText('Help').tagName).toBe('DIV');
  });

  it.each([
    ['default', 'text-tertiary'],
    ['muted', 'text-quaternary'],
    ['danger', 'text-danger'],
    ['warning', 'text-warning'],
  ] as const)('colours the %s variant as %s', (variant, colour) => {
    render(<FormText variant={variant}>Note</FormText>);
    const text = screen.getByText('Note');
    expect(text).toHaveClass(colour);
    if (variant !== 'default') expect(text).not.toHaveClass('text-tertiary');
  });

  it('lets a class override the variant colour', () => {
    render(
      <FormText variant="muted" className="text-primary">
        Note
      </FormText>,
    );
    expect(screen.getByText('Note')).toHaveClass('text-primary');
    expect(screen.getByText('Note')).not.toHaveClass('text-quaternary');
  });
});

describe('FieldScope', () => {
  it('links a label and a control that sit in different cells', () => {
    render(
      <FieldScope>
        <table>
          <tbody>
            <tr>
              <th>
                <FormLabel>Cell label</FormLabel>
              </th>
              <td>
                <Input />
              </td>
            </tr>
          </tbody>
        </table>
      </FieldScope>,
    );
    expect(screen.getByLabelText('Cell label').tagName).toBe('INPUT');
  });

  it('serves a hand-written label through useFieldLabelFor', () => {
    const Own = () => <label htmlFor={useFieldLabelFor()}>Own label</label>;
    render(
      <FieldScope>
        <Own />
        <Input />
      </FieldScope>,
    );
    expect(screen.getByLabelText('Own label').tagName).toBe('INPUT');
  });

  it('prefers an explicit htmlFor', () => {
    const Own = () => <label htmlFor={useFieldLabelFor('given')}>Given</label>;
    render(
      <FieldScope>
        <Own />
        <Input id="given" />
      </FieldScope>,
    );
    expect(screen.getByLabelText('Given')).toHaveAttribute('id', 'given');
  });

  it('moves the label to the next control when the first one unmounts', async () => {
    const Rows = () => {
      const [showFirst, setShowFirst] = useState(true);
      return (
        <FormField>
          <FormLabel>Rows</FormLabel>
          {showFirst && <Input data-testid="first" />}
          <Input data-testid="second" />
          <button onClick={() => setShowFirst(false)}>Remove first</button>
        </FormField>
      );
    };
    render(<Rows />);
    expect(screen.getByLabelText('Rows')).toBe(screen.getByTestId('first'));
    await userEvent.click(screen.getByText('Remove first'));
    expect(screen.getByLabelText('Rows')).toBe(screen.getByTestId('second'));
  });

  it('points its controls at the help and error text', () => {
    const { rerender } = render(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormText>Letters only.</FormText>
      </FormField>,
    );
    const help = screen.getByText('Letters only.');
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-describedby',
      help.id,
    );
    rerender(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormText>Letters only.</FormText>
        <FormText variant="danger">Required.</FormText>
      </FormField>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-describedby',
      `${help.id} ${screen.getByText('Required.').id}`,
    );
    rerender(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormText>Letters only.</FormText>
      </FormField>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-describedby',
      help.id,
    );
  });

  it("keeps a control's own aria-describedby and adds the field's", () => {
    render(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input aria-describedby="mine" />
        <FormText>Help</FormText>
      </FormField>,
    );
    expect(
      screen.getByLabelText('Name').getAttribute('aria-describedby'),
    ).toMatch(/^mine /);
  });

  it('describes every kind of control, and leaves a lone control alone', () => {
    render(
      <>
        <FormField>
          <Textarea aria-label="T" />
          <NativeSelect aria-label="S" />
          <RangeInput aria-label="R" />
          <FormText>Help</FormText>
        </FormField>
        <Input aria-label="Lone" />
      </>,
    );
    const id = screen.getByText('Help').id;
    for (const name of ['T', 'S', 'R']) {
      expect(screen.getByLabelText(name)).toHaveAttribute(
        'aria-describedby',
        id,
      );
    }
    expect(screen.getByLabelText('Lone')).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('lists a text the control already points at only once', () => {
    render(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input aria-describedby="help" />
        <FormText id="help">Help</FormText>
      </FormField>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-describedby',
      'help',
    );
  });

  describe('FormFieldset', () => {
    it('names the group by its legend and each control by its own label', () => {
      render(
        <FormFieldset>
          <FormLegend>Business hours</FormLegend>
          <FormField>
            <FormLabel>From</FormLabel>
            <Input />
          </FormField>
          <FormField>
            <FormLabel>Till</FormLabel>
            <Input />
          </FormField>
        </FormFieldset>,
      );
      const group = screen.getByRole('group', { name: 'Business hours' });
      expect(group.tagName).toBe('FIELDSET');
      expect(screen.getByLabelText('From')).not.toBe(
        screen.getByLabelText('Till'),
      );
      expect(screen.getByLabelText('From').id).not.toBe(
        screen.getByLabelText('Till').id,
      );
    });

    it('describes the fieldset, not each control, with its help text', () => {
      render(
        <FormFieldset>
          <FormLegend>Range</FormLegend>
          <Input aria-label="Low" />
          <Input aria-label="High" />
          <FormText>Both ends are inclusive.</FormText>
        </FormFieldset>,
      );
      expect(
        screen.getByRole('group', { name: 'Range' }),
      ).toHaveAccessibleDescription('Both ends are inclusive.');
      expect(screen.getByLabelText('Low')).not.toHaveAttribute(
        'aria-describedby',
      );
      expect(screen.getByLabelText('High')).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('lets a control inside keep help text of its own field', () => {
      render(
        <FormFieldset>
          <FormLegend>Range</FormLegend>
          <FormField>
            <FormLabel>Low</FormLabel>
            <Input />
            <FormText>Inclusive.</FormText>
          </FormField>
        </FormFieldset>,
      );
      expect(screen.getByLabelText('Low')).toHaveAccessibleDescription(
        'Inclusive.',
      );
    });
  });
});

describe('FormHeading', () => {
  it('looks like a label but is not one', () => {
    render(<FormHeading required>Preview</FormHeading>);
    const heading = screen.getByText('Preview');
    expect(heading.tagName).toBe('SPAN');
    expect(heading).toHaveClass('font-medium', "after:content-['*']");
    expect(screen.queryByLabelText('Preview')).toBeNull();
  });

  it('can be a block and can name a region', () => {
    render(
      <>
        <FormHeading as="p" id="rate-label">
          Rate
        </FormHeading>
        <div role="group" aria-labelledby="rate-label" />
      </>,
    );
    expect(screen.getByText('Rate').tagName).toBe('P');
    expect(screen.getByRole('group', { name: 'Rate' })).toBeInTheDocument();
  });
});
