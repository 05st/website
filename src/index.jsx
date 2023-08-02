import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Home } from './pages/Home.jsx';
import { Resume } from './pages/Resume.jsx';
import { NotFound } from './pages/_404.jsx';
import './index.css';

export function App() {
	return (
		<LocationProvider>
			<Router>
				<Route default path="/" component={Home} />
				<Route path="/resume" component={Resume} />
				<Route component={NotFound} />
			</Router>
		</LocationProvider>
	);
}

render(<App />, document.getElementById('app'));
