import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { overrideSettings } from 'waldur-js-client';

import { BaseButton, FormField, FormLabel, NativeSelect } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { BaseTextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

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
        <div key={index} className="mb-2.5">
          <div className="flex gap-1.5">
            <BaseInputField
              containerClassName="flex-1"

              value={item.value}
              onChange={(e) => updateItem(index, 'value', e.target.value)}
              placeholder={translate('Value (e.g., 10K+)')}
            />
            <BaseInputField
              containerClassName="flex-1"

              value={item.label}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              placeholder={translate('Label (e.g., Active Users)')}
            />
            <RemovalActionButton
              action={() => removeItem(index)}
              tooltip={translate('Remove')}
            />
          </div>
        </div>
      ))}
      <BaseButton
        onClick={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        label={translate('Add stat')}
        variant="tertiary"
        size="sm"
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
        <div key={index} className="mb-2.5">
          <FormField className="mb-1.5">
            <FormLabel className="text-xs text-quaternary mb-1">
              {translate('Title')}
            </FormLabel>
            <div className="flex gap-1.5">
              <BaseInputField
                containerClassName="flex-1"

                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder={translate('e.g., Welcome to Our Platform')}
              />
              <RemovalActionButton
                action={() => removeItem(index)}
                tooltip={translate('Remove')}
              />
            </div>
          </FormField>
          <FormField>
            <FormLabel className="text-xs text-quaternary mb-1">
              {translate('Subtitle')}
            </FormLabel>
            <BaseInputField
              containerClassName="flex-1"

              value={item.subtitle}
              onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
              placeholder={translate('e.g., Get started with cloud resources')}
            />
          </FormField>
          {index < items.length - 1 && <hr className="my-3" />}
        </div>
      ))}
      <BaseButton
        onClick={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        label={translate('Add slide')}
        variant="tertiary"
        size="sm"
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
        <div key={index} className="mb-2.5">
          <FormField className="mb-1.5">
            <FormLabel className="text-xs text-quaternary mb-1">
              {translate('Title')}
            </FormLabel>
            <div className="flex gap-1.5">
              <BaseInputField
                containerClassName="flex-1"

                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder={translate('e.g., New Feature Released')}
              />
              <RemovalActionButton
                action={() => removeItem(index)}
                tooltip={translate('Remove')}
              />
            </div>
          </FormField>
          <div className="flex gap-1.5 mb-1.5">
            <FormField style={{ width: '120px' }}>
              <FormLabel className="text-xs text-quaternary mb-1">
                {translate('Date')}
              </FormLabel>
              <BaseInputField
                containerClassName="flex-1"

                value={item.date}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                placeholder={translate('e.g., Jan 2025')}
              />
            </FormField>
            <FormField style={{ width: '140px' }}>
              <FormLabel className="text-xs text-quaternary mb-1">
                {translate('Tag')}
              </FormLabel>
              <NativeSelect
                value={item.tag}
                onChange={(e) => updateItem(index, 'tag', e.target.value)}
              >
                {NEWS_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          <FormField>
            <FormLabel className="text-xs text-quaternary mb-1">
              {translate('Description')}
            </FormLabel>
            <BaseTextField
              rows={2}

              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder={translate('Brief description of the news item...')}
            />
          </FormField>
          {index < items.length - 1 && <hr className="my-3" />}
        </div>
      ))}
      <BaseButton
        onClick={addItem}
        iconNode={<PlusCircleIcon weight="bold" />}
        label={translate('Add news item')}
        variant="tertiary"
        size="sm"
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
  const submitMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      overrideSettings({
        body: { [item.key]: items },
      }),
    successMessage: translate('Configuration has been updated.'),
    errorMessage: translate('Unable to update configuration.'),
    onSuccess: () => {
      location.reload();
    },
  });

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
          <CloseDialogButton className="flex-1" />
          <BaseButton
            pending={submitMutation.isPending}
            className="flex-1"
            onClick={() => submitMutation.mutate()}
            label={translate('Confirm')}
            variant="primary"
            size="lg"
          />
        </>
      }
    >
      <p className="text-quaternary mb-2.5">{item.description}</p>
      {renderEditor()}
    </ModalDialog>
  );
};
