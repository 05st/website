import Link from '../components/Link.jsx';
import MediaButton from '../components/MediaButton.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faFile } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

import avatarImg from '../assets/avatar.png';

const resumeLink = "https://drive.google.com/file/d/110AwdSIa9Y8tX_995jeLwqZtSwFHlLAn/view";

export function Home() {
	return (
		<>
			<div class="w-screen h-max md:h-screen flex flex-col bg-slate-100">
				<div class="w-full h-full grid max-md:grid-rows-2 md:grid-cols-2">
					<div class="m-12 w-fit md:w-1/2 self-center drop-shadow-2xl">
						<img src={avatarImg} class="w-full h-full rounded-full" alt="Avatar" />
					</div>

					<div class="m-12 md:mr-12 w-fit h-min self-center">
						<h1 class="text-6xl mb-2 font-bold text-center md:text-left drop-shadow-md">Sami Timsina</h1>
						<p class="text-lg font-normal p-2 leading-normal flex flex-col gap-4">
							<div>
							Hi, welcome to my website! Perhaps you know me by my online handle, <b>05st</b>.
							</div>
							<div>
							I'm currently a Computer Science student at the University of Waterloo, class of 2028. You may be interested in some of my <Link to="https://github.com/05st">projects</Link>, or my <Link to={resumeLink}>résumé</Link>.
							</div>
							<div>
							In my free time, I enjoy programming and playing guitar among many other things. Very occassionally, I write <Link to="https://blog.stimsina.com">blog posts</Link> about programming, computer science, and mathematics.
							</div>
						</p>
						<div class="w-full text-5xl flex flex-row gap-4 m-2">
							<MediaButton to="mailto:stimsina@protonmail.com">
								<FontAwesomeIcon icon={faEnvelope} />
							</MediaButton>
							<MediaButton to="https://www.linkedin.com/in/stimsina/">
								<FontAwesomeIcon icon={faLinkedin} />
							</MediaButton>
							<MediaButton to="https://github.com/05st">
								<FontAwesomeIcon icon={faGithub} />
							</MediaButton>
							<MediaButton to={resumeLink}>
								<FontAwesomeIcon icon={faFile} />
							</MediaButton>
						</div>
					</div>
				</div>
				<footer class="p-1">
					<p class="text-sm text-center text-secondary text-gray-500">© 2024 Sami Timsina</p>
				</footer>
			</div>
		</>
	);
}
