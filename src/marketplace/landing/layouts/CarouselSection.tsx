import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useRef } from 'react';

import { BaseButton } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

interface CarouselSectionProps {
  title: string;
  children: React.ReactNode;
  linkProps?: { state: string; params?: object };
}

export const CarouselSection: FC<CarouselSectionProps> = ({
  title,
  children,
  linkProps,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="card card-bordered carousel-section mb-5">
      <div className="card-header gap-1.5">
        <h4 className="mb-0">{title}</h4>
        <div className="flex items-stretch gap-1.5">
          <BaseButton
            iconNode={<CaretLeftIcon weight="bold" />}
            tooltip={translate('Scroll left')}
            onClick={() => scroll('left')}
            size="sm"
            variant="tertiary"
          />
          <BaseButton
            iconNode={<CaretRightIcon weight="bold" />}
            tooltip={translate('Scroll right')}
            onClick={() => scroll('right')}
            size="sm"
            variant="tertiary"
          />
          {linkProps && (
            <Link
              {...linkProps}
              buttonVariant="tertiary"
              buttonSize="sm"
              className="inline-flex items-center"
            >
              {translate('View all')}
              <CaretRightIcon size={16} className="ms-1" weight="bold" />
            </Link>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="carousel-scroll" ref={scrollRef}>
          {children}
        </div>
      </div>
    </div>
  );
};
