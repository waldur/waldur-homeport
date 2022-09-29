import { debounce, throttle } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

// Refer to https://stackoverflow.com/a/42234988

export const useOutsideClickHandler = () => {
  const [toggle, setToggle] = useState<boolean>(false);
  const wrapperRef = useRef(null);

  const setToggleFn = useCallback(
    throttle(
      (value: boolean) => {
        setToggle(value);
      },
      600,
      { trailing: false },
    ),
    [setToggle],
  );

  const handleClickOutside = debounce((event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setToggleFn(false);
    }
  }, 500);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return { wrapperRef, toggle, setToggle: setToggleFn };
};
