import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Navbar } from './components/Navbar.jsx';
import { About } from './pages/About.jsx';
import { BlogList, BlogPost }from './pages/Blog.jsx';
import { NotFound } from './pages/_404.jsx';
import './index.css';

export function App() {
	return (
		<div class="h-screen md:grid md:grid-cols-3 md:place-items-center">
			<LocationProvider>
				<div class="justify-self-end">
					<Navbar />
				</div>
				<Router>
					<Route path="/" component={About} />
					<Route path="/blog" component={BlogList} />
					<Route path="/blog/:slug" component={BlogPost} />
					<Route default component={NotFound} />
				</Router>
			</LocationProvider>
		</div>
	);
}

render(<App />, document.getElementById('app'));
