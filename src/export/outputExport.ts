import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { formatOutputForExport } from "./outputFormat";

type ExportableOutput = {
  title: string;
  body: string;
};

export async function copyOutput(output: ExportableOutput): Promise<void> {
  await Clipboard.setStringAsync(formatOutputForExport(output));
}

export async function shareOutput(output: ExportableOutput): Promise<void> {
  await Share.share({
    title: output.title.trim(),
    message: formatOutputForExport(output),
  });
}
