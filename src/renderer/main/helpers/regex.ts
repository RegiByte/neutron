const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp(text: string) {
  return text.replace(matchOperatorsRe, '\\$&');
}
