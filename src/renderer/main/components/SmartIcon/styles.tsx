import React from 'react';
import styled, { css, } from "styled-components";
import { RESULT_HEIGHT, } from "../../../../constants/ui";

export const Image = styled.img`
  max-height: 30px;
  max-width: 30px;
  margin-right: 5px;
`;

interface RowContainerProps {
  selected: boolean;
  onClick: (event: Event) => any;
  onMouseMove: (event: Event) => any;
}

export const RowContainer: React.FunctionComponent<RowContainerProps> = styled.div`
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  height: ${RESULT_HEIGHT}px;
  padding: 3px 5px;
  align-items: center;
  ${(props: RowContainerProps): any => props.selected && css`
    background: transparent;
  `}
`;

export const Details = styled.div`
  position: relative;
  display: flex;
  flex-grow: 2;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 90%;
`;
export const Title = styled.div`
  font-size: .8em;
  max-width: 100%;
`;
export const SubTitle = styled.div`
  font-size: .8em;
  font-weight: 300;
  max-width: 100%;
`;
