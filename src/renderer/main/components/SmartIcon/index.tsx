import memoizee from "memoizee";
import React from "react";
import { Image, } from "./styles";

const isImage = (path: string): boolean => !!path.match(/(^data:)|(\.(png|jpe?g|svg)$)/);

interface Props {
  path: string;
}

const SmartIcon: React.FunctionComponent<Props> = ({ path, }) => {
  if (isImage(path)) {
    return (
      <Image src={path} alt={path}/>
    );
  }

  return null;
};

export default memoizee(SmartIcon);
