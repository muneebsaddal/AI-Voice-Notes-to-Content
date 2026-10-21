import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import type { Theme } from "../types";

type IconName =
  | "ellipsis"
  | "back"
  | "forward"
  | "check"
  | "chevronUp"
  | "copy"
  | "share"
  | "close"
  | "trash"
  | "play";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type IconTextProps = {
  name: IconName;
  color?: string;
  size?: number;
  theme: Theme;
};

const iconNames: Record<IconName, IoniconName> = {
  ellipsis: "ellipsis-horizontal",
  back: "arrow-back",
  forward: "chevron-forward",
  check: "checkmark",
  chevronUp: "chevron-up",
  copy: "copy-outline",
  share: "share-outline",
  close: "close",
  trash: "trash-outline",
  play: "play",
};

export function IconText({ name, color, size = 24, theme }: IconTextProps) {
  return <Ionicons name={iconNames[name]} color={color ?? theme.colors.foreground} size={size} />;
}
