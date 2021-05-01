import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import 'react-calendar/dist/Calendar.css'
import 'react-toastify/dist/ReactToastify.min.css'
import 'react-datepicker/dist/react-datepicker.css'
import './app/layout/index.css';
import App from './app/layout/App';
import { store, StoreContext } from './app/stores/store';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ScrollToTop from './app/layout/ScrollToTop';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Suspense } from 'react';

export const history = createBrowserHistory();

ReactDOM.render(
  <StoreContext.Provider value={ store }>
    <Router history={ history }>
      <ScrollToTop />
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={ <div>Loading...</div> }>
          <App />
        </Suspense>
      </I18nextProvider>
    </Router>
  </StoreContext.Provider>,
  document.getElementById('root')
);