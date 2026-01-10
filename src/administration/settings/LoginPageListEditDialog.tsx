import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { overrideSettings } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { ActionButton } from '@waldur/table/ActionButton';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

import { getKeyTitle } from './utils';

interface StatItem {
  value: string;
  label: string;
}

interface CarouselSlide {
  title: string;
  subtitle: string;
}

interface NewsItem {
  date: string;
  title: string;
  description: string;
  tag: string;
}

const NEWS_TAGS = [
  'Feature',
  'Update',
  'Security',
  'Announcement',
  'Maintenance',
];

// Stats Editor
const StatsEditor: FC<{
  items: StatItem[];
  onChange: (items: StatItem[]) => void;
}> = ({ items, onChange }) => {
  const addItem = () => onChange([...items, { value: '', label: '' }]);
  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof StatItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="mb-3">
          <InputGroup>
            <Form.Control
              className="form-control"
              value={item.value}
              onChange={(e) => updateItem(index, 'value', e.target.value)}
              placeholder={translate('Value (e.g., 10K+)')}
            />
            <Form.Control
              className="form-control"
              value={item.label}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              placeholder={translate('Label (e.g., Active Users)')}
            />
            <ActionButton
              variant="danger"
              action={() => removeItem(index)}
              tooltip={translate('Remove')}
              iconNode={<TrashIcon weight="bold" />}
            />
          </InputGroup>
        </div>
      ))}
      <CompactActionButton
        action={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        title={translate('Add stat')}
      />
    </div>
  );
};

// Carousel Slides Editor
const CarouselSlidesEditor: FC<{
  items: CarouselSlide[];
  onChange: (items: CarouselSlide[]) => void;
}> = ({ items, onChange }) => {
  const addItem = () => onChange([...items, { title: '', subtitle: '' }]);
  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const updateItem = (
    index: number,
    field: keyof CarouselSlide,
    value: string,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="mb-3">
          <Form.Group className="mb-2">
            <Form.Label className="fs-8 text-muted mb-1">
              {translate('Title')}
            </Form.Label>
            <InputGroup>
              <Form.Control
                className="form-control"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder={translate('e.g., Welcome to Our Platform')}
              />
              <ActionButton
                variant="danger"
                action={() => removeItem(index)}
                tooltip={translate('Remove')}
                iconNode={<TrashIcon weight="bold" />}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Label className="fs-8 text-muted mb-1">
              {translate('Subtitle')}
            </Form.Label>
            <Form.Control
              className="form-control"
              value={item.subtitle}
              onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
              placeholder={translate('e.g., Get started with cloud resources')}
            />
          </Form.Group>
          {index < items.length - 1 && <hr className="my-4" />}
        </div>
      ))}
      <CompactActionButton
        action={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        title={translate('Add slide')}
      />
    </div>
  );
};

// News Items Editor
const NewsItemsEditor: FC<{
  items: NewsItem[];
  onChange: (items: NewsItem[]) => void;
}> = ({ items, onChange }) => {
  const addItem = () =>
    onChange([
      ...items,
      { date: '', title: '', description: '', tag: 'Update' },
    ]);
  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof NewsItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="mb-3">
          <Form.Group className="mb-2">
            <Form.Label className="fs-8 text-muted mb-1">
              {translate('Title')}
            </Form.Label>
            <InputGroup>
              <Form.Control
                className="form-control"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder={translate('e.g., New Feature Released')}
              />
              <ActionButton
                variant="danger"
                action={() => removeItem(index)}
                tooltip={translate('Remove')}
                iconNode={<TrashIcon weight="bold" />}
              />
            </InputGroup>
          </Form.Group>
          <div className="d-flex gap-2 mb-2">
            <Form.Group style={{ width: '120px' }}>
              <Form.Label className="fs-8 text-muted mb-1">
                {translate('Date')}
              </Form.Label>
              <Form.Control
                className="form-control"
                value={item.date}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                placeholder={translate('e.g., Jan 2025')}
              />
            </Form.Group>
            <Form.Group style={{ width: '140px' }}>
              <Form.Label className="fs-8 text-muted mb-1">
                {translate('Tag')}
              </Form.Label>
              <Form.Select
                className="form-select"
                value={item.tag}
                onChange={(e) => updateItem(index, 'tag', e.target.value)}
              >
                {NEWS_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <Form.Group>
            <Form.Label className="fs-8 text-muted mb-1">
              {translate('Description')}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              className="form-control"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder={translate('Brief description of the news item...')}
            />
          </Form.Group>
          {index < items.length - 1 && <hr className="my-4" />}
        </div>
      ))}
      <CompactActionButton
        action={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        title={translate('Add news item')}
      />
    </div>
  );
};

interface LoginPageListEditDialogProps {
  resolve: {
    item: { key: string; description: string };
    value: any[];
  };
}

export const LoginPageListEditDialog: FC<LoginPageListEditDialogProps> = ({
  resolve,
}) => {
  const { item, value: initialValue } = resolve;
  const [items, setItems] = useState<any[]>(initialValue || []);
  const [submitting, setSubmitting] = useState(false);
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await overrideSettings({
        body: { [item.key]: items },
      });
      showSuccess(translate('Configuration has been updated.'));
      closeDialog();
      location.reload();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update configuration.'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderEditor = () => {
    switch (item.key) {
      case 'LOGIN_PAGE_STATS':
        return <StatsEditor items={items} onChange={setItems} />;
      case 'LOGIN_PAGE_CAROUSEL_SLIDES':
        return <CarouselSlidesEditor items={items} onChange={setItems} />;
      case 'LOGIN_PAGE_NEWS':
        return <NewsItemsEditor items={items} onChange={setItems} />;
      default:
        return <p>{translate('Unknown field type')}</p>;
    }
  };

  return (
    <ModalDialog
      title={getKeyTitle(item.key)}
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={submitting}
            className="flex-equal"
            onClick={handleSubmit}
            type="button"
            label={translate('Confirm')}
          />
        </>
      }
    >
      <p className="text-muted mb-3">{item.description}</p>
      {renderEditor()}
    </ModalDialog>
  );
};
