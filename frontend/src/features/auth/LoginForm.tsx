import { FormEvent, useState } from 'react';
import Card from '../../components/ui/Card';
import Field from '../../components/ui/Field';
import MessageBox from '../../components/ui/MessageBox';
import type { Message } from './types';

type LoginFormProps = {
    onSubmit: (data: { email: string; password: string }, reset: () => void) => void;
    busy: boolean;
    message?: Message;
};

export default function LoginForm({ onSubmit, busy, message }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ email, password }, () => {
            setEmail('');
            setPassword('');
        });
    };

    return (
        <Card title="Login">
            <form className="stack" onSubmit={submit}>
                <Field
                    label="E-Mail"
                    name="login_email"
                    type="email"
                    required
                    value={email}
                    onChange={(name, value) => setEmail(value)}
                />
                <Field
                    label="Passwort"
                    name="login_password"
                    type="password"
                    required
                    value={password}
                    onChange={(name, value) => setPassword(value)}
                />
                <MessageBox tone={message?.tone}>{message?.text}</MessageBox>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? 'Wird geprÇ¬ft...' : 'Einloggen'}
                </button>
            </form>
        </Card>
    );
}
