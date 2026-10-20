import { FunctionComponent, useMemo, useState } from 'react';

import { Checkbox } from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { FormGroup } from '@/form/FormGroup';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { EVENT_GROUP_SECTIONS } from './eventGroupLabels';
import { EventGroupOption } from './types';

export const MultiSelectField: FunctionComponent<{
  input;
  options: EventGroupOption[];
}> = ({ input, options }) => {
  const [query, setQuery] = useState('');

  // Options arrive sorted by section, so consecutive runs form the sections.
  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result: {
      key: string;
      title: string;
      options: EventGroupOption[];
    }[] = [];
    for (const option of options) {
      if (
        needle &&
        !option.title.toLowerCase().includes(needle) &&
        !option.description?.toLowerCase().includes(needle)
      ) {
        continue;
      }
      const key = option.section ?? 'other';
      const last = result[result.length - 1];
      if (last?.key === key) {
        last.options.push(option);
      } else {
        result.push({
          key,
          title: option.section
            ? EVENT_GROUP_SECTIONS[option.section]()
            : translate('Other'),
          options: [option],
        });
      }
    }
    return result;
  }, [options, query]);

  return (
    <>
      <FormGroup label={translate('Events')} space={5}>
        <FilterBox
          type="search"
          placeholder={translate('Filter events')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FormGroup>
      <div className="h-[300px] overflow-y-auto">
        {sections.length === 0 ? (
          <NoResult
            message={translate('No events match the filter.')}
            buttonTitle={translate('Clear filter')}
            callback={() => setQuery('')}
          />
        ) : (
          sections.map(({ key, title, options: sectionOptions }) => (
            <div
              key={key}
              role="group"
              aria-labelledby={`event-section-${key}`}
              className="mb-5 flex flex-col gap-5"
            >
              <h6 id={`event-section-${key}`} className="mb-0">
                {title}
              </h6>
              {sectionOptions.map((option) => (
                <Checkbox
                  key={option.key}
                  id={`checkbox-${option.key}`}
                  checked={input.value[option.key] || false}
                  onChange={(e) =>
                    input.onChange({
                      ...input.value,
                      [option.key]: e.target.checked,
                    })
                  }
                  label={option.title}
                  description={option.description}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
};
