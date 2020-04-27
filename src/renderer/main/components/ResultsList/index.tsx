import React, { useCallback, } from 'react';
import { Preview, ResultsWrapper, } from "./styles";
import { Result, } from "../../states/searchBar";
import { List, } from 'react-virtualized';
import { RESULT_HEIGHT, } from "../../../../constants/ui";
import Row from "./Row";

interface Props {
  selected: number;
  visibleResults: number;
  onItemHover: (index: number) => any;
  onSelect: (result: Result, event: Event) => any;
  mainInputFocused: boolean;
  results: Result[];
}

const ResultsList: React.FunctionComponent<Props> = ({
  visibleResults,
  results,
  selected,
  mainInputFocused,
  onItemHover,
  onSelect,
}) => {
  const rowRenderer = useCallback(({ index, }) => {
    const result = results[index];
    const attrs = {
      ...result,
      selected: index === selected,
      onSelect: (event: Event): any => onSelect(result, event),
      onMouseMove: (event: any): any => {
        const { movementX, movementY, } = event.nativeEvent;
        if (index === selected || !mainInputFocused) {
          return false;
        }

        if (movementX || movementY) {
          onItemHover(index);
        }
      },
      key: result.id,
    };

    return <Row {...attrs}/>;
  }, [ results, selected, mainInputFocused, onItemHover, ]);

  const renderPreview = useCallback(() => {
    const selectedEl = results[selected];

    if (!selectedEl) return;

    if (!selectedEl.getPreview) {
      return null;
    }
    const preview = selectedEl.getPreview();

    if (typeof preview === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: preview, }}/>;
    }

    return preview;
  }, [ selected, results, ]);

  return (
    <ResultsWrapper>
      <List
        height={visibleResults * RESULT_HEIGHT}
        overscanRowCount={2}
        rowCount={results.length}
        rowHeight={RESULT_HEIGHT}
        rowRenderer={rowRenderer}
        width={10000}
        scrollToIndex={selected}
        titles={results.map(result => result.title)}
        tabIndex={null}
      />
      <Preview>
        {renderPreview()}
      </Preview>
    </ResultsWrapper>
  );
};

export default ResultsList;
