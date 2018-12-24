import * as React from 'react';
import { render } from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux'

import App from './App';
import './index.css';
import { register as registerServiceWorker } from './service-worker';
import store from './store';

const container = document.getElementById('root') as HTMLElement;

render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  container
);
registerServiceWorker();
