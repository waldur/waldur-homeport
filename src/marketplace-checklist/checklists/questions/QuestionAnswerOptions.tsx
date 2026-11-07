import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DotsSixVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  Card,
  FormField,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'waldur-ui';

import { required, requiredArray } from '@/core/validators';
import { StringField } from '@/form';
import { translate } from '@/i18n';

const SortableField = ({ name, index, onRemove, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(index), animateLayoutChanges: () => false });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      hoverable={false}
      divided={false}
      {...attributes}
    >
      <TableCell
        width={30}
        ref={setActivatorNodeRef}
        {...listeners}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        <DotsSixVerticalIcon
          size={24}
          weight="bold"
          className="text-quaternary"
        />
      </TableCell>
      <TableCell>
        <Field name={name} validate={required}>
          {({ input, meta }) => <StringField input={input} meta={meta} />}
        </Field>
      </TableCell>
      <TableCell width={60}>
        <BaseButton
          tooltip={translate('Remove')}
          onClick={onRemove}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-danger"
          disabled={disabled}
          disabledReason={translate('At least two options are required')}
          size="lg"
        />
      </TableCell>
    </TableRow>
  );
};

const DraggableFieldsListGroup = ({
  fields,
}: FieldArrayRenderProps<string, HTMLElement>) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const addDisabled = fields.value?.some((v) => !v);

  if (fields.length === 0) {
    fields.push('');
  }

  const addRow = () => {
    if (!addDisabled) {
      fields.push('');
    }
  };

  const removeRow = (index) => fields.length > 0 && fields.remove(index);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      fields.move(oldIndex, newIndex);
    }
  };

  return (
    <Card bordered id="question-answer-options" className="bg-secondary py-2.5">
      <FormField>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table scrollable={false} className="mb-0 align-middle">
            <TableBody>
              <SortableContext
                items={fields.map((_, index) => String(index))}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((name, index) => (
                  <SortableField
                    key={name}
                    index={index}
                    name={name}
                    onRemove={() => removeRow(index)}
                    disabled={fields.length < 2}
                  />
                ))}
              </SortableContext>
              <TableRow divided={false} hoverable={false}>
                <TableCell />
                <TableCell colSpan={2}>
                  <BaseButton
                    onClick={addRow}
                    label={translate('Add answer')}
                    iconNode={<PlusIcon weight="bold" />}
                    variant="text-primary"
                    disabled={addDisabled}
                    disabledReason={translate(
                      'Fill in all options before adding more',
                    )}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DndContext>
      </FormField>
    </Card>
  );
};

export const QuestionAnswerOptions = () => (
  <FieldArray
    name="options"
    component={DraggableFieldsListGroup}
    validate={requiredArray}
  />
);
