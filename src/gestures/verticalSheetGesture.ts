type VerticalGesture = {
  translationX: number;
  translationY: number;
  velocityY: number;
};

type HistoryDismissGesture = VerticalGesture & {
  scrollOffsetY: number;
};

const horizontalFailureDistance = 32;
const historyOpenDistance = 72;
const historyOpenVelocity = 750;
const historyCloseDistance = 88;
const historyCloseVelocity = 850;
const scrollTopTolerance = 1;

export function shouldOpenHistory(gesture: VerticalGesture): boolean {
  if (Math.abs(gesture.translationX) > horizontalFailureDistance) {
    return false;
  }

  return (
    gesture.translationY <= -historyOpenDistance ||
    gesture.velocityY <= -historyOpenVelocity
  );
}

export function shouldCloseHistory(
  gesture: HistoryDismissGesture,
): boolean {
  if (
    gesture.scrollOffsetY > scrollTopTolerance ||
    Math.abs(gesture.translationX) > horizontalFailureDistance
  ) {
    return false;
  }

  return (
    gesture.translationY >= historyCloseDistance ||
    gesture.velocityY >= historyCloseVelocity
  );
}
