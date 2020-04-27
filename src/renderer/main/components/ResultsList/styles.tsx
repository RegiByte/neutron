import styled from 'styled-components';

export const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  position: relative;
`;

export const Preview = styled.div.attrs({
  id: 'preview',
})`
  flex-grow: 2;
  padding: 10px 10px 20px 10px;
  align-items: center;
  display: flex;
  max-height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 250px;
  right: 0;
  overflow: auto;
  
  &::before, &::after {
    content: ' ';
    margin: auto;
  }
  
  &:empty {
    display: none;
  }
  
  :global {
    /* Styles for react-select */
    .Select {
      .Select-control {
        border: var(--preview-input-border);
        background: var(--preview-input-background);
        color: var(--preview-input-color);
      }
      .Select-menu-outer {
        border: var(--preview-input-border);
        background: var(--preview-input-background);
      }
      .Select-input input {
        border: 0;
      }
      .Select-value-label {
        color: var(--preview-input-color) !important;
      }
      .Select-option {
        background: var(--preview-input-background);
        color: var(--preview-input-color);
        &.is-selected {
          color: var(--selected-result-title-color);
          background: var(--selected-result-background);
        }
        &.is-focused {
          color: var(--selected-result-title-color);
          background: var(--selected-result-background);
          filter: opacity(50%);
        }
      }
      .Select-option.is-selected {
      }
    }
  }
`;
