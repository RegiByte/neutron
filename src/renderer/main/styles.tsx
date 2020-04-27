import styled from 'styled-components';
import { APP_NAME, } from "../../constants/strings";

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const InputWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MainInput = styled.input.attrs({
  placeholder: `${APP_NAME} Search`,
  id: 'main-input',
})`
  width: 100%;
  height: 45px;
  font-size: 1.5em;
  border: 0;
  outline: none;
  padding: 0 10px;
  line-height: 60px;
  background: transparent;
  white-space: nowrap;
  user-select: none;
`;

export const Autocomplete = styled.div`
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 45px;
  font-size: 1.5em;
  padding: 0 10px;
  line-height: 46px;
  white-space: pre;
`;

export const StatusBar = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 5px;
  border-radius: 5px 0 0 0;
  border-width: 1px 0 0 1px;
  font-size: .75em;
`;
