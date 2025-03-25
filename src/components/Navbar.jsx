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
        <nav class="p-4 flex flex-row gap-2 lg:p-0 lg:flex-col lg:gap-0 lg:text-right">
            <Item href="/">about</Item>
            <Item href="/blog">blog</Item>
        </nav>
    );
}
