export const cursorIsEndOfInput = ({ selectionStart, selectionEnd, value, }: HTMLInputElement): boolean => {
  return selectionStart === selectionEnd && selectionStart >= value.length;
};

export const focusableSelector = [
  // Links & areas with href attribute
  'a[href]',
  'area[href]',

  // Not disabled form elements
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',

  // All elements with tabindex >= 0
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

export const focusPreview = () => {
  const previewDom = document.querySelector('#preview');
  const firstFocusable = previewDom.querySelector(focusableSelector) as HTMLElement;

  if (firstFocusable) {
    firstFocusable.focus();
  }
};
