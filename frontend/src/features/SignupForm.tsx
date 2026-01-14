import { FormEvent, useState } from 'react';
import { SignupInput, calculateAge } from '../app/api';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import MessageBox from '../components/ui/MessageBox';
import type { Message } from './types';

export type SignupFormData = SignupInput & { emailConfirm: string };

export const getSignupValidationError = (form: SignupFormData): string | null => {
    if (form.email !== form.emailConfirm) {
        return 'E-Mail und Bestビtigung stimmen nicht グberein.';
    }
    const age = calculateAge(form.birth_date);
    if (age === null || age < 18) {
        return 'Du musst mindestens 18 Jahre alt sein.';
    }
    return null;
};

export const toSignupInput = (form: SignupFormData): SignupInput => ({
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    password: form.password,
    birth_date: new Date(form.birth_date).toISOString(),
    phone: form.phone || null,
    profile_image: form.profile_image || null,
    additional_note: form.additional_note || null,
});

const initialSignup: SignupFormData = {
    first_name: '',
    last_name: '',
    email: '',
    emailConfirm: '',
    password: '',
    birth_date: '',
    phone: '',
    profile_image: '',
    additional_note: '',
};

type SignupFormProps = {
    onSubmit: (data: SignupFormData, reset: () => void) => void;
    busy: boolean;
    message?: Message;
};

export default function SignupForm({ onSubmit, busy, message }: SignupFormProps) {
    const [form, setForm] = useState<SignupFormData>(initialSignup);

    const handleChange = (name: string, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(form, () => setForm(initialSignup));
    };

    return (
        <Card title="Registrieren">
            <form className="stack" onSubmit={submit}>
                <div className="grid grid--two">
                    <Field label="Vorname" name="first_name" required value={form.first_name} onChange={handleChange} />
                    <Field label="Nachname" name="last_name" required value={form.last_name} onChange={handleChange} />
                </div>
                <div className="grid grid--two">
                    <Field
                        label="E-Mail"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Field
                        label="E-Mail bestätigen"
                        name="emailConfirm"
                        type="email"
                        required
                        value={form.emailConfirm}
                        onChange={handleChange}
                    />
                </div>
                <Field
                    label="Passwort"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                />
                <Field
                    label="Geburtstag"
                    name="birth_date"
                    type="date"
                    required
                    value={form.birth_date}
                    onChange={handleChange}
                />
                <div className="grid grid--two">
                    <Field
                        label="Handynummer (intern)"
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        placeholder="optional, später verpflichtend für Angebote"
                    />
                    <Field
                        label="Profilbild-URL"
                        name="profile_image"
                        value={form.profile_image || ''}
                        onChange={handleChange}
                        placeholder="z. B. https://..."
                    />
                </div>
                <label className="field">
                    <span>Notiz</span>
                    <textarea
                        className="field__control"
                        name="additional_note"
                        value={form.additional_note || ''}
                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                        rows={3}
                        placeholder="Hinweise für Mitfahrer*innen"
                    />
                </label>
                <MessageBox tone={message?.tone}>{message?.text}</MessageBox>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? 'Wird gesendet...' : 'Registrieren'}
                </button>
            </form>
        </Card>
    );
}
