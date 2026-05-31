import { Easing } from "react-native";

export const motion = {
  textSwapMs: 160,
  iconSwapMs: 200,
  pageMs: 220,
  sheetOpenMs: 400,
  sheetCloseMs: 300,
  successMs: 520,
  orbBreatheMs: 3200,
  orbPulseMs: 2200,
  easeOut: Easing.bezier(0.22, 1, 0.36, 1),
  easeInOut: Easing.inOut(Easing.ease),
};
