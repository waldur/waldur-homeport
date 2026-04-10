import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useRef } from 'react';
import { Card } from 'react-bootstrap';

import { CompactIconButton } from '@waldur/core/buttons/IconButton';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

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
    <Card className="card-bordered carousel-section mb-6">
      <Card.Header className="gap-2">
        <h4 className="mb-0">{title}</h4>
        <div className="d-flex align-items-stretch gap-2">
          <CompactIconButton
            iconNode={<CaretLeftIcon weight="bold" />}
            tooltip={translate('Scroll left')}
            onClick={() => scroll('left')}
          />
          <CompactIconButton
            iconNode={<CaretRightIcon weight="bold" />}
            tooltip={translate('Scroll right')}
            onClick={() => scroll('right')}
          />
          {linkProps && (
            <Link
              {...linkProps}
              className="btn btn-sm btn-tertiary d-inline-flex align-items-center"
            >
              {translate('View all')}
              <CaretRightIcon size={16} className="ms-1" weight="bold" />
            </Link>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="carousel-scroll" ref={scrollRef}>
          {children}
        </div>
      </Card.Body>
    </Card>
  );
};
