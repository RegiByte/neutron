import ReactDOM from 'react-dom';
import React from 'react';
import rpc from "../../utils/rpc";

const App: React.FunctionComponent = () => (
  <div>
    hello world
  </div>
);

ReactDOM.render(
  <App/>,
  document.querySelector('#app')
);

rpc.on('showTerm', term => {
  console.log(term);
});

console.log('app created');
