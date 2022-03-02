import { useCallback, useEffect, useRef, useState } from 'react';

import '@waldur/marketplace/offerings/SidebarResizer.css';

export const SidebarResizer = () => {
  const sidebarRef = useRef(
    document.getElementsByClassName('sidebarEditor')[0] as HTMLElement,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(600);

  useEffect(() => {
    const el = document.getElementsByClassName(
      'sidebarEditor',
    )[0] as HTMLElement;
    if (el) sidebarRef.current = el;
  });

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing && sidebarRef.current) {
        setSidebarWidth(
          sidebarRef.current.getBoundingClientRect().right -
            mouseMoveEvent.clientX,
        );
      }
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.width = sidebarWidth + 'px';
    }
  }, [sidebarWidth]);

  return <div className="sidebar-resizer" onMouseDown={startResizing} />;
};
