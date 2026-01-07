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
import { Button, Card, Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required, requiredArray } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

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
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td
        width={30}
        ref={setActivatorNodeRef}
        {...listeners}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        <span className="svg-icon svg-icon-1 svg-icon-gray">
          <DotsSixVerticalIcon weight="bold" />
        </span>
      </td>
      <td>
        <Field component={StringField as any} name={name} validate={required} />
      </td>
      <td width={60}>
        <Button
          variant="text-danger"
          className="btn-icon"
          onClick={onRemove}
          disabled={disabled}
        >
          <span className="svg-icon svg-icon-1">
            <TrashIcon weight="bold" />
          </span>
        </Button>
      </td>
    </tr>
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
    <Card
      id="question-answer-options"
      className="card-bordered bg-gray-25 py-3"
    >
      <Form.Group>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="table g-1 mb-0 align-middle">
            <tbody>
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
              <tr>
                <td />
                <td colSpan={2}>
                  <Button
                    variant="text-primary"
                    onClick={addRow}
                    disabled={addDisabled}
                    size="sm"
                  >
                    <span className="svg-icon svg-icon-2">
                      <PlusIcon weight="bold" />
                    </span>
                    {translate('Add answer')}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </DndContext>
      </Form.Group>
    </Card>
  );
};

export const QuestionAnswerOptions = () => (
  <FieldArray
    name="options"
    component={DraggableFieldsListGroup}
    rerenderOnEveryChange
    validate={requiredArray}
  />
);
