import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { Field, useField, useForm } from 'react-final-form';
import { OfferingComponent } from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import {
  DiscountTier,
  evaluateTiers,
  parseFormulaToTiers,
  tiersToFormula,
} from './discountFormula';

const getAggregationOptions = () => [
  {
    value: 'customer',
    label: translate("Aggregated across the customer's resources"),
  },
  { value: 'resource', label: translate('Per resource') },
];

interface ComponentDiscountEditorProps {
  component: OfferingComponent;
}

export const ComponentDiscountEditor: FunctionComponent<
  ComponentDiscountEditorProps
> = ({ component }) => {
  const form = useForm();
  const base = `discounts.${component.type}`;
  // Subscribe to this component's formula only, so a keystroke in one
  // component's editor does not re-render every other component's editor.
  const { input: formulaField } = useField(`${base}.discount_formula`, {
    subscription: { value: true },
  });
  const currentFormula: string = formulaField.value || '';

  const initialTiers = parseFormulaToTiers(
    form.getState().values?.discounts?.[component.type]?.discount_formula || '',
  );
  const [mode, setMode] = useState<'tiers' | 'advanced'>(
    initialTiers === null ? 'advanced' : 'tiers',
  );
  const [tiers, setTiers] = useState<DiscountTier[]>(initialTiers || []);
  const [sampleUsage, setSampleUsage] = useState('');

  const commitTiers = (next: DiscountTier[]) => {
    setTiers(next);
    form.change(`${base}.discount_formula`, tiersToFormula(next));
  };
  const updateTier = (
    index: number,
    key: 'threshold' | 'percent',
    raw: string,
  ) =>
    commitTiers(
      tiers.map((tier, i) =>
        i === index ? { ...tier, [key]: raw === '' ? '' : Number(raw) } : tier,
      ),
    );

  const sample = Number(sampleUsage);
  const previewPercent =
    sampleUsage !== '' && !Number.isNaN(sample)
      ? evaluateTiers(tiers, sample)
      : null;

  const canUseTierBuilder = parseFormulaToTiers(currentFormula) !== null;

  return (
    <div className="mb-8 border-bottom pb-6">
      <div className="mb-3">
        <strong>{component.name}</strong>
        {component.measured_unit && (
          <span className="text-muted ms-2">({component.measured_unit})</span>
        )}
      </div>

      <div className="mb-4" style={{ maxWidth: 400 }}>
        <SelectGroup
          name={`${base}.discount_aggregation`}
          label={translate('Discount scope')}
          options={getAggregationOptions()}
          simpleValue
          isClearable={false}
          spaceless
        />
      </div>

      {mode === 'tiers' ? (
        <>
          {tiers.length === 0 && (
            <p className="text-muted mb-3">
              {translate('No discount — add a tier to grant one.')}
            </p>
          )}
          {tiers.map((tier, index) => (
            <div className="d-flex align-items-center gap-2 mb-2" key={index}>
              <span className="text-muted">{translate('when usage ≥')}</span>
              <input
                type="number"
                className="form-control"
                style={{ width: 120 }}
                value={tier.threshold}
                onChange={(e) => updateTier(index, 'threshold', e.target.value)}
              />
              <span className="mx-1">→</span>
              <input
                type="number"
                className="form-control"
                style={{ width: 90 }}
                value={tier.percent}
                onChange={(e) => updateTier(index, 'percent', e.target.value)}
              />
              <span className="text-muted">{translate('% off')}</span>
              <BaseButton
                type="button"
                variant="danger"
                size="sm"
                className="ms-1"
                tooltip={translate('Remove tier')}
                iconNode={<TrashIcon weight="bold" />}
                onClick={() => commitTiers(tiers.filter((_, i) => i !== index))}
              />
            </div>
          ))}
          <div className="d-flex align-items-center gap-4 mt-3">
            <BaseButton
              type="button"
              variant="tertiary"
              size="sm"
              iconNode={<PlusIcon weight="bold" />}
              label={translate('Add tier')}
              onClick={() =>
                commitTiers([...tiers, { threshold: '', percent: '' }])
              }
            />
            <BaseButton
              type="button"
              variant="text-primary"
              size="sm"
              label={translate('Advanced: edit formula')}
              onClick={() => setMode('advanced')}
            />
          </div>
          {tiers.length > 0 && (
            <div className="d-flex align-items-center gap-2 mt-4 text-muted">
              {translate('Preview: at usage')}
              <input
                type="number"
                className="form-control form-control-sm"
                style={{ width: 100 }}
                value={sampleUsage}
                placeholder="100"
                onChange={(e) => setSampleUsage(e.target.value)}
              />
              {previewPercent != null && <span>→ {previewPercent}% off</span>}
            </div>
          )}
        </>
      ) : (
        <>
          <Field name={`${base}.discount_formula`}>
            {({ input }) => (
              <input
                type="text"
                className="form-control"
                {...input}
                placeholder={translate('e.g. MIN(20, usage / 100)')}
              />
            )}
          </Field>
          <p className="text-muted mt-1 mb-2">
            {translate(
              'Percentage discount as a function of the usage (bound to `usage`), clamped to 0-100. Functions: MIN, MAX, LN, LOG10, FLOOR, CEIL, POW, ABS.',
            )}
          </p>
          {canUseTierBuilder && (
            <BaseButton
              type="button"
              variant="text-primary"
              size="sm"
              label={translate('Back to tier builder')}
              onClick={() => {
                setTiers(parseFormulaToTiers(currentFormula) || []);
                setMode('tiers');
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
