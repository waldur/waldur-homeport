import { CaretDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useBoolean } from 'react-use';

import { translate } from '@/i18n';
import { PriceField } from '@/marketplace/resources/change-limits/PriceField';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { StateProps } from './utils';

export const ComponentTotalRow: FC<
  Pick<StateProps, 'totalPeriods' | 'changedTotalPeriods' | 'periods'> & {
    periodsCountToShow: number;
  }
> = ({ totalPeriods, changedTotalPeriods, periods, periodsCountToShow }) => {
  const [toggled, setToggle] = useBoolean(false);
  const canExpand = totalPeriods.length > periodsCountToShow;

  return (
    <>
      <tr
        onClick={setToggle}
        className={toggled && canExpand ? 'expanded' : undefined}
      >
        <td colSpan={5} className="text-end">
          {canExpand && (
            <span className={toggled ? 'me-2 active' : 'me-2'}>
              <CaretDownIcon size={20} weight="bold" className="rotate-180" />
            </span>
          )}
          <span className="fw-bolder text-dark me-10">
            {translate('Total')}:
          </span>
        </td>
        {totalPeriods.slice(0, periodsCountToShow).map((price, index) => (
          <td key={index} className="fw-bold text-dark">
            <PriceField
              price={price}
              changedPrice={changedTotalPeriods[index]}
            />
          </td>
        ))}
      </tr>
      {toggled && canExpand && (
        <tr>
          <td colSpan={12}>
            <ExpandableContainer>
              {totalPeriods.map((price, index) =>
                index >= periodsCountToShow ? (
                  <Field
                    key={index}
                    label={periods[index]}
                    value={
                      <PriceField
                        price={price}
                        changedPrice={changedTotalPeriods[index]}
                      />
                    }
                  />
                ) : null,
              )}
            </ExpandableContainer>
          </td>
        </tr>
      )}
    </>
  );
};
