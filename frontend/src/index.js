import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './store'
import { Provider } from 'react-redux'
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Provider store={store}>
    <App />
  </Provider>
  </React.StrictMode>
);


reportWebVitals();
