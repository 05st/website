import Link from '../components/Link.jsx';

export function About() {
	return (
		<article class="w-full">
			<h1 class="text-base text-left font-medium">sami timsina</h1>
			<p class="text-base text-left font-normal flex flex-col">
				<span>hey! welcome to my website.</span>
				<span>i'm currently a computer science student at the university of waterloo.</span>
			</p>
			<div class="flex flex-row gap-2 mt-1">
				<Link href="https://github.com/05st" target="_blank">github</Link>
				<Link href="https://www.linkedin.com/in/stimsina/" target="_blank">linkedin</Link>
			</div>
		</article>
	);
}
