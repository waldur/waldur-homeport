import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isEmpty } from '@waldur/core/utils';
import { Offering, Section } from '@waldur/marketplace/types';

export const shouldRenderAttributesSection = (offering: Offering): boolean =>
  !!offering.datacite_doi ||
  offering.citation_count >= 0 ||
  (!!offering.google_calendar_link && offering.type === OFFERING_TYPE_BOOKING);

export const shouldRenderAttributesList = (
  sections: Section[],
  attributes,
): boolean => !!sections.length && !isEmpty(attributes);

export const isValidAttribute = (data: any): boolean => {
  if (typeof data === 'string' && data.trim().length > 0) {
    return true;
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return true;
  }
  if (typeof data === 'object' && !isEmpty(data)) {
    return true;
  }
  if (Array.isArray(data) && data.length > 0) {
    return true;
  }
  return false;
};

export interface RingChartOption {
  title: string;
  label: string;
  value: number;
  max?: number;
}

export const getRingChartOptions = (props: RingChartOption) => {
  const emptySpace = (props.max || 100) - props.value;
  return {
    title: {
      text: props.title,
      left: 'center',
      bottom: 'bottom',
      textStyle: {
        color: '#008800',
        fontSize: 12,
        fontWeight: '500',
      },
    },
    color: ['#008800', '#19331F'],
    series: [
      {
        type: 'pie',
        startAngle: '270',
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          textStyle: {
            color: '#008800',
            fontSize: 12,
            fontWeight: '500',
          },
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          label: {
            fontSize: 14,
          },
        },
        hoverOffset: 2,
        data: [
          {
            value: props.value,
            name: props.label,
          },
          {
            value: emptySpace,
          },
        ],
        radius: ['68%', '80%'],
      },
    ],
  };
};
