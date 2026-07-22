import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';

export const SwipeBackContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { goBack, currentScreen } = useApp();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    // If swiped right by more than 80px and horizontal movement is dominant, and started from left half of screen
    if (deltaX > 80 && deltaY < 60 && touchStartX.current < window.innerWidth * 0.6) {
      if (currentScreen !== 'dashboard' && currentScreen !== 'welcome') {
        goBack();
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 flex flex-col min-h-screen"
    >
      {children}
    </div>
  );
};
