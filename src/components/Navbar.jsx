import { useLocation } from 'preact-iso';

function Item(props) {
    const { path }  = useLocation();
    const isActive = path == props.href || path.startsWith(props.href + '/');
    
    return (
        <p class={isActive ? "text-neutral-600" : "text-neutral-400 hover:text-neutral-600"}>
            <a {...props} />
        </p>
    )
}

export function Navbar() {
    return (
        <nav class="p-4 flex flex-row gap-2 md:p-0 md:flex-col md:gap-0 md:text-right">
            <Item href="/">about</Item>
            <Item href="/blog">blog</Item>
        </nav>
    );
}
