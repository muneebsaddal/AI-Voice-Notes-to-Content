export type OutputTitleMetrics = {
  fontSize: number;
  lineHeight: number;
};

export function getOutputTitleMetrics(
  viewportWidth: number,
): OutputTitleMetrics {
  return viewportWidth <= 360
    ? { fontSize: 24, lineHeight: 30 }
    : { fontSize: 27, lineHeight: 34 };
}
