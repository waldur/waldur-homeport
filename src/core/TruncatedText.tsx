import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { truncate } from '@waldur/core/utils';

const LETTER_WITH = 6.5; // px

export const TruncatedText = ({ text, min = 4, padding = 0 }) => {
  const [_text, setText] = useState(text);
  const ref = useRef<HTMLDivElement>();

  const checkWidth = debounce(() => {
    if (!ref.current) return;
    const wrapperWidth = ref.current?.clientWidth - padding;
    const length = wrapperWidth / LETTER_WITH;
    setText(truncate(text, Math.max(min, length)));
  }, 50);

  useEffect(() => {
    window.addEventListener('resize', checkWidth);
    checkWidth();
    return () => window.removeEventListener('resize', checkWidth);
  }, [checkWidth, ref?.current]);

  return (
    <>
      <div ref={ref} className="w-100" />
      <div className="d-inline-block">{_text}</div>
    </>
  );
};
