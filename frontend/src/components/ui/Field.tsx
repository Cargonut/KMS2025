type FieldProps = {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'date';
    required?: boolean;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
};

export default function Field({
    label,
    name,
    type = 'text',
    required,
    value,
    onChange,
    placeholder,
    className,
    inputClassName,
}: FieldProps) {
    const labelClassName = className ? `field ${className}` : 'field';
    const inputClasses = inputClassName ? `field__control ${inputClassName}` : 'field__control';

    return (
        <label className={labelClassName}>
            <span>{label}</span>
            <input
                className={inputClasses}
                name={name}
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                placeholder={placeholder}
            />
        </label>
    );
}
