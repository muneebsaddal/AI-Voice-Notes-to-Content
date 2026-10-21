type ExportableOutput = {
  title: string;
  body: string;
};

export function formatOutputForExport(output: ExportableOutput): string {
  return `# ${output.title.trim()}\n\n${output.body.trim()}`;
}
