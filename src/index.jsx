import { Analytics } from '@vercel/analytics/react';
import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { Navbar } from './components/Navbar.jsx';
import { About } from './pages/About.jsx';
import { BlogList, BlogPost }from './pages/Blog.jsx';
import { NotFound } from './pages/_404.jsx';
import './index.css';
import 'katex/dist/katex.min.css';

export function App() {
	return (
		<div>
			<Analytics />
			<LocationProvider>
				<div class="h-screen lg:grid lg:grid-cols-3 lg:place-items-center">
					<div class="lg:justify-self-end lg:mr-4">
						<Navbar />
					</div>
					<div class="w-full p-4 place-items-center lg:place-items-start lg:p-0">
						<Router>
							<Route path="/" component={About} />
							<Route path="/blog" component={BlogList} />
							<Route path="/blog/:slug" component={BlogPost} />
							<Route default component={NotFound} />
						</Router>
					</div>
				</div>
			</LocationProvider>
		</div>
	);
}

render(<App />, document.getElementById('app'));
