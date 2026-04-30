export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="/images/tasty-logo.png" 
            alt="منصة تيستي" 
            style={{ height: '52px', width: 'auto', ...props.style }} 
        />
    );
}
