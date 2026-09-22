import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import {
  BaseProviderPlan,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { Select } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { MergeDraft } from '../utils';

const Mismatch: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-danger fs-7 mt-1 d-flex align-items-center gap-1">
    <WarningCircleIcon weight="bold" />
    {children}
  </div>
);

const planLabel = (plan: BaseProviderPlan) =>
  [
    plan.name,
    plan.unit ? `(${plan.unit})` : '',
    plan.archived ? translate('archived') : '',
  ]
    .filter(Boolean)
    .join(' ');

const componentLabel = (component: OfferingComponent) =>
  `${component.name} (${component.type}, ${component.billing_type})`;

interface MappingStepProps {
  sources: ProviderOfferingDetails[];
  target: ProviderOfferingDetails;
  draft: MergeDraft;
  onChange(draft: MergeDraft): void;
  disabled: boolean;
  onApplySuggestions?(): void;
  applyingSuggestions?: boolean;
}

export const MappingStep: FC<MappingStepProps> = ({
  sources,
  target,
  draft,
  onChange,
  disabled,
  onApplySuggestions,
  applyingSuggestions,
}) => {
  const targetPlans = target.plans ?? [];
  const targetComponents = target.components ?? [];

  const setPlan = (sourcePlan: string, targetPlan?: string) => {
    const plan_mapping = { ...draft.plan_mapping };
    if (targetPlan) {
      plan_mapping[sourcePlan] = targetPlan;
    } else {
      delete plan_mapping[sourcePlan];
    }
    onChange({ ...draft, plan_mapping });
  };

  const setComponent = (
    offering: string,
    sourceType: string,
    targetType?: string,
  ) => {
    const mapping = { ...(draft.component_mapping[offering] ?? {}) };
    if (targetType) {
      mapping[sourceType] = targetType;
    } else {
      delete mapping[sourceType];
    }
    onChange({
      ...draft,
      component_mapping: { ...draft.component_mapping, [offering]: mapping },
    });
  };

  return (
    <div className="d-flex flex-column gap-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <p className="text-muted mb-0">
          {translate(
            'Map every source plan and component that resources, orders or usage refer to. Unused ones may stay unmapped: they remain on the archived source.',
          )}
        </p>
        {onApplySuggestions && !disabled && (
          <BaseButton
            label={translate('Fill in suggestions')}
            variant="tertiary"
            onClick={onApplySuggestions}
            pending={applyingSuggestions}
          />
        )}
      </div>
      {sources.map((source) => (
        <FormTable.Card key={source.uuid} title={source.name}>
          <FormTable>
            <FormTable.Item
              label={<h5 className="mb-0">{translate('Plans')}</h5>}
            />
            {(source.plans ?? []).length === 0 && (
              <FormTable.Item
                label={translate('Plans')}
                value={translate('The source has no plans.')}
              />
            )}
            {(source.plans ?? []).map((plan) => {
              const selected = targetPlans.find(
                (option) => option.uuid === draft.plan_mapping[plan.uuid],
              );
              return (
                <FormTable.Item
                  key={plan.uuid}
                  label={planLabel(plan)}
                  htmlFor={`plan-${plan.uuid}`}
                  value={
                    <>
                      <Select
                        inputId={`plan-${plan.uuid}`}
                        options={targetPlans}
                        value={selected ?? null}
                        getOptionValue={(option: BaseProviderPlan) =>
                          option.uuid
                        }
                        getOptionLabel={planLabel}
                        onChange={(option: BaseProviderPlan | null) =>
                          setPlan(plan.uuid, option?.uuid)
                        }
                        isClearable
                        isDisabled={disabled}
                        placeholder={translate('Not mapped')}
                      />
                      {selected && selected.unit !== plan.unit && (
                        <Mismatch>
                          {translate(
                            'Billed per {source} on the source but per {target} on the target.',
                            { source: plan.unit, target: selected.unit },
                          )}
                        </Mismatch>
                      )}
                    </>
                  }
                />
              );
            })}
            <FormTable.Item
              label={<h5 className="mb-0">{translate('Components')}</h5>}
            />
            {(source.components ?? []).length === 0 && (
              <FormTable.Item
                label={translate('Components')}
                value={translate('The source has no components.')}
              />
            )}
            {(source.components ?? []).map((component) => {
              const selected = targetComponents.find(
                (option) =>
                  option.type ===
                  draft.component_mapping[source.uuid]?.[component.type],
              );
              return (
                <FormTable.Item
                  key={component.type}
                  label={componentLabel(component)}
                  htmlFor={`component-${source.uuid}-${component.type}`}
                  value={
                    <>
                      <Select
                        inputId={`component-${source.uuid}-${component.type}`}
                        options={targetComponents}
                        value={selected ?? null}
                        getOptionValue={(option: OfferingComponent) =>
                          option.type
                        }
                        getOptionLabel={componentLabel}
                        onChange={(option: OfferingComponent | null) =>
                          setComponent(
                            source.uuid,
                            component.type,
                            option?.type,
                          )
                        }
                        isClearable
                        isDisabled={disabled}
                        placeholder={translate('Not mapped')}
                      />
                      {selected &&
                        selected.billing_type !== component.billing_type && (
                          <Mismatch>
                            {translate(
                              'Billed as {source} on the source but as {target} on the target.',
                              {
                                source: component.billing_type,
                                target: selected.billing_type,
                              },
                            )}
                          </Mismatch>
                        )}
                    </>
                  }
                />
              );
            })}
          </FormTable>
        </FormTable.Card>
      ))}
    </div>
  );
};
