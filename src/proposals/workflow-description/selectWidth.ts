/**
 * A select's width from its longest option, so it keeps one size whichever
 * option is picked: the label's characters (a "0" is wider than the average
 * letter, hence 0.8ch each) plus the control's padding and chevron.
 */
export const widthOfLongest = (options: { label: string }[]) =>
  `calc(${Math.max(...options.map((option) => option.label.length), 8)} * 0.8ch + 56px)`;
