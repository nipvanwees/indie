import { type TouchEvent, useState } from "react";

interface SwipeInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
}

interface SwipeOutput {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

export default (input: SwipeInput): SwipeOutput => {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);

  const minSwipeDistance = 80;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEndX(0); // otherwise the swipe is fired even with usual touch events
    setTouchEndY(0); // otherwise the swipe is fired even with usual touch events
    //@ts-expect-error because
    setTouchStartX(e.targetTouches[0].clientX);
    //@ts-expect-error because
    setTouchStartY(e.targetTouches[0]?.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    //@ts-expect-error because
    setTouchEndX(e.targetTouches[0].clientX);
    //@ts-expect-error because
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchStartY || !touchEndX || !touchEndY) return;
    // check the x
    const distanceX = touchStartX - touchEndX;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    // check th y
    const distanceY = touchStartY - touchEndY;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // check if there are multiple swipes
    const count = [isLeftSwipe, isRightSwipe, isUpSwipe, isDownSwipe].filter(
      (swipe) => swipe,
    ).length;

    if (count > 1) {
      console.log("multiple swipes");
      return;
    }

    if (isLeftSwipe && input.onSwipedLeft) {
      input.onSwipedLeft();
    }
    if (isRightSwipe && input.onSwipedRight) {
      input.onSwipedRight();
    }

    if (isUpSwipe && input.onSwipedUp) {
      input.onSwipedUp();
    }
    if (isDownSwipe && input.onSwipedDown) {
      input.onSwipedDown();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
