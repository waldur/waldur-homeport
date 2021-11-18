import { useEffect, useRef, useState } from 'react';

// Refer to https://stackoverflow.com/a/42234988

export const useOutsideClickHandler = () => {
  const [toggle, setToggle] = useState<boolean>(false);
  const wrapperRef = useRef(null);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setToggle(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return { wrapperRef, toggle, setToggle };
};
