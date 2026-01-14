type FieldProps = {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'date';
    required?: boolean;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
};

export default function Field({
    label,
    name,
    type = 'text',
    required,
    value,
    onChange,
    placeholder,
}: FieldProps) {
    return (
        <label className="field">
            <span>{label}</span>
            <input
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
