export function chapterVisual(chapterNumber: number) {
  const visuals = [
    "visual-genesis",
    "visual-silence",
    "visual-obsidian",
    "visual-guard",
    "visual-lineage",
  ];
  return visuals[(chapterNumber - 1) % visuals.length];
}
