import './index.css';
import 'katex/dist/katex.min.css';
import { hydrate } from 'preact-iso';
import { App } from './app.jsx';

hydrate(<App />, document.getElementById('app'));
