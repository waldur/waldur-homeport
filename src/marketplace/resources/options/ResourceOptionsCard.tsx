import { ArrowRightIcon, InfoIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { MultiEditOptionsAction } from '../mass-actions/MultiEditOptionsAction';

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
    <span className="d-inline-flex align-items-center gap-2 flex-wrap">
      <span className="text-muted">
        <OptionValue option={option} value={oldValue} />
      </span>
      <ArrowRightIcon size={16} className="text-muted" weight="bold" />
      <span>
        <OptionValue option={option} value={newValue} />
      </span>
      <Tip
        id={`pending-change-${option.name}`}
        label={translate('This value was changed in a pending order')}
      >
        <InfoIcon
          size={16}
          weight="fill"
          className="text-info cursor-pointer"
        />
      </Tip>
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

  if (!resourceOptions?.order?.length) {
    return (
      <div className="justify-content-center row">
        <div className="col-sm-4">
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
        <div className="fs-7 fw-normal text-success mt-1">
          {translate('{count} pending changes', { count: pendingChangesCount })}
        </div>
      )}
    </div>
  );

  return (
    <FormTable.Card
      title={title}
      refetch={props.refetch}
      loading={props.isLoading}
      className="card-bordered"
      actions={
        props.resource.state === 'OK' && (
          <MultiEditOptionsAction
            rows={[props.resource]}
            refetch={props.refetch}
            asButton
          />
        )
      }
    >
      <FormTable>
        {resourceOptions.order?.map((key) => {
          const option = {
            ...resourceOptions.options[key],
            name: key,
          };
          const isPendingChange = pendingChange?.changedKeys.includes(key);
          const currentValue =
            props.resource.options && props.resource.options[key];

          return (
            <FormTable.Item
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
      </FormTable>
    </FormTable.Card>
  );
};
