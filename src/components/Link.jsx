export default function Link(props) {
    return (
        <a class="text-blue-600 hover:font-semibold" href={props.to} target="_blank">
            {props.children}
        </a>
    );
}
