import React from 'react';
import ReactDOM from 'react-dom';

const Test = () => <h1>Test</h1>;

const ReactDOMRender = () => {
    const container = document.getElementById('rdr-container');

    ReactDOM.render(<Test />, container);

    return null;
};

export default ReactDOMRender;
