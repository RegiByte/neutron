import React from 'react';
import SmartIcon from "../SmartIcon";
import { Details, RowContainer, SubTitle, Title, } from "../SmartIcon/styles";

interface Props {
  title: string;
  icon?: string;
  selected: boolean;
  subtitle?: string;
  onSelect?: (event: Event) => any;
  onMouseMove?: (event: Event) => any;
}

const Row: React.FunctionComponent<Props> = ({ title, icon, selected, subtitle, onSelect, onMouseMove, }) => {
  return (
    <RowContainer selected={selected} onClick={onSelect} onMouseMove={onMouseMove}>
      {icon && (
        <SmartIcon path={icon}/>
      )}
      <Details>
        {title && <Title>{title}</Title>}
        {subtitle && <SubTitle>{subtitle}</SubTitle>}
      </Details>
    </RowContainer>
  );
};

export default Row;
