import { ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Resource, Offering } from 'waldur-js-client';

import { PropertyCard, PropertyItem, PropertyList, HelpIcon } from 'waldur-ui';

import { translate } from '@/i18n';

import { getDerivedLimitInputs } from '../../common/derivedLimits';
import { getHiddenOptionKeys } from '../../common/optionVisibility';
import { MultiEditOptionsAction } from '../mass-actions/MultiEditOptionsAction';

import { hasOptionSecrets } from './optionSecrets';
import {
  formatSecretStatusValue,
  OptionSecretsCard,
  SecretActions,
} from './OptionSecretsCard';
import { OptionValue } from './OptionValue';
import { UpdateResourceOptionButton } from './UpdateResourceOptionButton';

interface ResourceOptionsCardProps {
  resource: Resource;
  offering: Offering;
  refetch?;
  isLoading?;
}

interface PendingOptionsChange {
  oldOptions: Record<string, any>;
  newOptions: Record<string, any>;
  changedKeys: string[];
}

const getPendingOptionsChange = (
  resource: Resource,
): PendingOptionsChange | null => {
  const order = resource.order_in_progress;
  if (!order) return null;

  const attributes = order.attributes as Record<string, any>;
  if (order.type === 'Update' && attributes?.new_options) {
    return {
      oldOptions: attributes.old_options || {},
      newOptions: attributes.new_options || {},
      changedKeys: Object.keys(attributes.new_options || {}),
    };
  }
  return null;
};

const PendingChangeValue: FC<{
  option: any;
  currentValue: any;
  oldValue: any;
  newValue: any;
}> = ({ option, oldValue, newValue }) => {
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className="text-quaternary">
        <OptionValue option={option} value={oldValue} />
      </span>
      <ArrowRightIcon size={16} className="text-quaternary" weight="bold" />
      <span>
        <OptionValue option={option} value={newValue} />
      </span>
      <HelpIcon
        label={translate('This value was changed in a pending order')}
        aria-label={translate('Pending change')}
        icon={InfoIcon}
        weight="fill"
        className="text-info cursor-pointer"
      />
    </span>
  );
};

export const ResourceOptionsCard: FC<ResourceOptionsCardProps> = (props) => {
  const resourceOptions = props.offering.resource_options;

  const pendingChange = useMemo(
    () => getPendingOptionsChange(props.resource),
    [props.resource],
  );

  const pendingChangesCount = pendingChange?.changedKeys.length || 0;

  const hiddenKeys = useMemo(
    () =>
      getHiddenOptionKeys(
        resourceOptions?.options,
        props.resource.options as Record<string, unknown>,
      ),
    [resourceOptions?.options, props.resource.options],
  );

  // Secrets of order options alone have no row below: they are listed
  // apart, with what can be done about them.
  const secretsCard = (
    <OptionSecretsCard
      resource={props.resource}
      offering={props.offering}
      refetch={props.refetch}
      names={Object.keys(props.resource.option_secrets || {}).filter(
        (name) => resourceOptions?.options?.[name]?.type !== 'secret',
      )}
    />
  );

  if (!resourceOptions?.order?.length) {
    if (hasOptionSecrets(props.resource)) {
      return secretsCard;
    }
    return (
      <div className="flex flex-wrap justify-center">
        <div className="w-full sm:w-4/12">
          <p className="text-center">
            {translate("Resource doesn't have options.")}
          </p>
        </div>
      </div>
    );
  }

  const title = (
    <div>
      {translate('Options')}
      {pendingChangesCount > 0 && (
        <div className="text-xs font-normal text-success mt-1">
          {translate('{count} pending changes', { count: pendingChangesCount })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <PropertyCard
        bordered
        title={title}
        refetch={props.refetch}
        loading={props.isLoading}
        actions={
          props.resource.state === 'OK' &&
          // Formula inputs and secrets are left out of editing several
          // options at once.
          resourceOptions.order.some(
            (key) =>
              !['component_formula', 'secret'].includes(
                resourceOptions.options[key]?.type,
              ),
          ) && (
            <MultiEditOptionsAction
              rows={[props.resource]}
              refetch={props.refetch}
              asButton
            />
          )
        }
      >
        <PropertyList>
          {resourceOptions.order?.map((key) => {
            // Options hidden by the resource's current values have no value
            // and cannot be edited on their own; the full options dialog shows
            // them once the controlling option is changed.
            if (hiddenKeys.has(key)) {
              return null;
            }
            const option = {
              ...resourceOptions.options[key],
              name: key,
            };
            // A secret is never shown nor edited with the others: its row
            // says whether it is set, and replaces or reveals it on its own.
            if (option.type === 'secret') {
              return (
                <PropertyItem
                  key={key}
                  label={option.label}
                  value={formatSecretStatusValue(
                    props.resource.option_secrets?.[key],
                    option.default_configs,
                    false,
                  )}
                  description={option.help_text}
                  actions={
                    <SecretActions
                      resource={props.resource}
                      name={key}
                      label={option.label}
                      policy={option.default_configs}
                      refetch={props.refetch}
                    />
                  }
                />
              );
            }
            const isPendingChange = pendingChange?.changedKeys.includes(key);
            // A formula input ordered before its resource option existed is
            // only in the resource's order attributes.
            const currentValue =
              option.type === 'component_formula'
                ? getDerivedLimitInputs(props.resource, props.offering)[key]
                : props.resource.options && props.resource.options[key];

            return (
              <PropertyItem
                key={key}
                label={option.label}
                value={
                  isPendingChange ? (
                    <PendingChangeValue
                      option={option}
                      currentValue={currentValue}
                      oldValue={pendingChange.oldOptions[key]}
                      newValue={pendingChange.newOptions[key]}
                    />
                  ) : (
                    <OptionValue option={option} value={currentValue} />
                  )
                }
                description={option.help_text}
                actions={
                  <UpdateResourceOptionButton
                    resource={props.resource}
                    offering={props.offering}
                    refetch={props.refetch}
                    option={option}
                  />
                }
              />
            );
          })}
        </PropertyList>
      </PropertyCard>
      <div className="mt-5">{secretsCard}</div>
    </>
  );
};
