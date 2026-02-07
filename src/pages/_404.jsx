import { useEffect } from 'preact/hooks';
import { siteTitle } from '../config/site.js';

export function NotFound() {
	useEffect(() => {
		if (typeof document === 'undefined') {
			return;
		}
		document.title = `404 — ${siteTitle}`;
	}, []);

	return (
		<section>
			<h1>404: Not Found</h1>
			<p>It doesn't exist :(</p>
		</section>
	);
}
