export default function MediaButton(props) {
    return (
        <a class="text-slate-600 opacity-80 hover:opacity-100 transition" href={props.to} target="_blank">
            {props.children}
        </a>
    );
}