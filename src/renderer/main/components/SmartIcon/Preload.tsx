import React, { ReactElement, useEffect, useRef, } from 'react';

interface Props {
  loader: ReactElement<any, string>;
  promise: Promise<any>;
  children: (src: string, error: Error) => ReactElement<any, string>;
}

const Preload: React.FunctionComponent<Props> = ({ loader, promise, children, }) => {
  const resultRef = useRef();
  const errorRef = useRef();

  useEffect(() => {
    promise.then(result => {
      resultRef.current = result;
    }).catch(error => {
      errorRef.current = error;
    });
  }, []);

  if (resultRef.current || errorRef.current) {
    return children(resultRef.current, errorRef.current);
  }

  return loader || null;
};

export default Preload;
