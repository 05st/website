import Link from '../components/Link.jsx';

const resumeLink = "https://drive.google.com/file/d/1beDuYbCS_u3OVsZrD9Hcbe09Rz6JU8jR/view"

export function About() {
	return (
		<article class="p-4 md:p-0">
			<h1 class="text-base text-left font-medium">sami timsina</h1>
			<p class="text-base text-left font-normal flex flex-col">
				<span>hey! welcome to my website.</span>
				<span>i'm currently a computer science student at the university of waterloo.</span>
			</p>
			<div class="flex flex-row gap-2 mt-1">
				<Link href="https://github.com/05st" target="_blank">github</Link>
				<Link href="https://www.linkedin.com/in/stimsina/" target="_blank">linkedin</Link>
				<Link href={resumeLink} target="_blank">resume</Link>
			</div>
		</article>
	);
}
