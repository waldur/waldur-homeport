import { FC, useRef, useState, useEffect } from 'react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { Badge } from './Badge';
import { SafeMarkdown } from './SafeMarkdown';

interface TruncatedMarkdownProps {
  text: string;
  maxHeight?: number;
  title?: string;
  smallTitles?: boolean;
  showInternalBadge?: boolean;
}

interface FullMarkdownModalProps {
  resolve: {
    text: string;
    title: string;
    smallTitles?: boolean;
    showInternalBadge?: boolean;
  };
}

const FullMarkdownModal: FC<FullMarkdownModalProps> = ({ resolve }) => {
  return (
    <div className="modal-header-less">
      <div className="modal-body">
        <h5 className="modal-title mb-3">
          {resolve.title}
          {resolve.showInternalBadge && (
            <>
              {' '}
              <Badge variant="warning" pill outline>
                {translate('Internal')}
              </Badge>
            </>
          )}
        </h5>
        <SafeMarkdown text={resolve.text} smallTitles={resolve.smallTitles} />
      </div>
    </div>
  );
};

export const TruncatedMarkdown: FC<TruncatedMarkdownProps> = ({
  text,
  maxHeight = 120,
  title = translate('Content'),
  smallTitles,
  showInternalBadge = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const { openDialog } = useModal();

  useEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const isOverflowing = element.scrollHeight > maxHeight;
        setIsTruncated(isOverflowing);
      }
    };

    checkTruncation();

    // Re-check on window resize
    const handleResize = () => {
      checkTruncation();
    };

    window.addEventListener('resize', handleResize);

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkTruncation, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [text, maxHeight]);

  const handleShowMore = () => {
    openDialog(FullMarkdownModal, {
      resolve: { text, title, smallTitles, showInternalBadge },
      size: 'lg',
    });
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isTruncated ? `${maxHeight}px` : 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SafeMarkdown text={text} smallTitles={smallTitles} />
        {isTruncated && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(transparent, var(--bs-body-bg))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '8px',
            }}
          />
        )}
      </div>
      {isTruncated && (
        <button
          type="button"
          className="text-anchor mt-2"
          onClick={handleShowMore}
          style={{ fontSize: '0.875rem' }}
        >
          {translate('Show more')}
        </button>
      )}
    </div>
  );
};
