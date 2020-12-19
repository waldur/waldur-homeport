import classNames from 'classnames';
import { useMemo, useState, FunctionComponent } from 'react';
import Select from 'react-select';

import { translate } from '@waldur/i18n';
import { ResourceIcon } from '@waldur/resource/ResourceName';

const SelectResourceButton = ({ value, onChange }) => (
  <a
    className={classNames(
      'btn btn-sm btn-outline',
      value ? 'btn-primary' : 'btn-default',
    )}
    onClick={onChange}
  >
    {value ? translate('Selected') : translate('Select')}
  </a>
);

const serializeResource = (resource) => ({
  name: resource.name,
  uuid: resource.backend_id,
  resource_type: resource.type,
});

const ExtraDataToggle = ({ value, onClick }) => (
  <td onClick={onClick}>
    {value ? (
      <i className="fa fa-chevron-down" />
    ) : (
      <i className="fa fa-chevron-right" />
    )}
  </td>
);

const ExtraDataRow = ({ resource }) => (
  <tr>
    <td colSpan={5}>
      <ul className="list-unstyled">
        {resource.extra.map((row, index) => (
          <li key={index}>
            <strong>{row.name}</strong>
            {': '}
            {row.value ? row.value : '—'}
          </li>
        ))}
      </ul>
    </td>
  </tr>
);

export const ResourceRow: FunctionComponent<{
  resource;
  value;
  toggleResource;
  offering;
  plans;
  assignPlan;
}> = ({ resource, value, toggleResource, offering, plans, assignPlan }) => {
  const payload = useMemo(() => serializeResource(resource), [resource]);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
        {resource.extra && resource.extra.length > 0 && (
          <ExtraDataToggle
            value={expanded}
            onClick={() => setExpanded(!expanded)}
          />
        )}
        <td>
          <p className="form-control-static">
            {resource.type ? (
              <ResourceIcon resource={payload} />
            ) : (
              resource.name
            )}
          </p>
        </td>
        <td>
          <p className="form-control-static">{resource.backend_id}</p>
        </td>
        <td>
          <SelectResourceButton
            value={value.includes(resource)}
            onChange={() => toggleResource(resource)}
          />
        </td>
        {offering.billable && (
          <td>
            <Select
              placeholder={translate('Select plan')}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              options={offering.plans}
              value={plans[resource.backend_id]}
              onChange={(plan) => assignPlan(resource, plan)}
              isClearable={false}
            />
          </td>
        )}
      </tr>
      {expanded && <ExtraDataRow resource={resource} />}
    </>
  );
};
