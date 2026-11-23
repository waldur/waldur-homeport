import { FC } from 'react';

import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { BooleanField } from '@/table/BooleanField';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import { getTypeLabel } from './localQuestions';
import { LocalQuestion, SurveyWizardValues } from './types';
import { getSubmitReason } from './validation';

const columns: Column<LocalQuestion>[] = [
  {
    title: translate('Question'),
    render: ({ row }) => (
      <span className="text-primary">{row.description}</span>
    ),
  },
  {
    title: translate('Type'),
    render: ({ row }) => getTypeLabel(row.question_type),
  },
  {
    title: translate('Required'),
    render: ({ row }) => <BooleanField value={row.required} />,
  },
];

const names = (items?: { name?: string }[]) => items?.map((item) => item.name);

export const ReviewStep: FC<WizardStepProps> = (props) => {
  const values: SurveyWizardValues = props.values;
  const submitReason = getSubmitReason(values, Boolean(props.data?.locked));

  return (
    <WizardModal
      {...props}
      submitDisabled={Boolean(submitReason)}
      submitTooltip={submitReason}
    >
      <PropertyCard bordered title={translate('Details')} className="mb-3">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Name')}
            value={propVal.text(values.name)}
          />
          <PropertyItem
            label={translate('Intro')}
            value={propVal.richText(values.intro, { format: 'markdown' })}
          />
        </PropertyList>
      </PropertyCard>
      <PropertyCard
        bordered
        title={translate('Audience & schedule')}
        className="mb-3"
      >
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Starts at')}
            value={propVal.date(values.starts_at, { precision: 'datetime' })}
          />
          <PropertyItem
            label={translate('Ends at')}
            value={propVal.date(values.ends_at, { precision: 'datetime' })}
          />
          <PropertyItem
            label={translate('Ask all users')}
            value={propVal.boolean(values.all_users)}
          />
          <PropertyItem
            label={translate('Organizations')}
            value={propVal.list(names(values.customers))}
          />
          <PropertyItem
            label={translate('Offerings')}
            value={propVal.list(names(values.offerings))}
          />
          <PropertyItem
            label={translate('Max prompts')}
            value={propVal.count(values.max_prompts)}
          />
          <PropertyItem
            label={translate('Snooze days')}
            value={propVal.count(values.snooze_days)}
          />
          <PropertyItem
            label={translate('Active')}
            value={propVal.boolean(values.is_active)}
          />
        </PropertyList>
      </PropertyCard>
      <PropertyCard bordered title={translate('Questions')}>
        <SimpleTable
          columns={columns}
          rows={values.questions ?? []}
          rowKey="key"
        />
      </PropertyCard>
    </WizardModal>
  );
};
