import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Profile,
    SignupInput,
    UpdateProfileInput,
    calculateAge,
    fetchProfile,
    loginUser,
    signupUser,
    updateProfile,
} from './api';

const storageKey = 'cargonaut-token';

const initialSignup: SignupInput & { emailConfirm: string } = {
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

const initialUpdate: UpdateProfileInput = {
    phone: '',
    profile_image: '',
    additional_note: '',
};

type Message = { tone: 'info' | 'success' | 'error' | 'warn'; text: string };

type FieldProps = {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'date';
    required?: boolean;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
};

function Card({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
    return (
        <section className="card">
            <div className="card__header">
                <h2>{title}</h2>
            </div>
            <div className="card__body">{children}</div>
            {footer && <div className="card__footer">{footer}</div>}
        </section>
    );
}

function MessageBox({ tone = 'info', children }: { tone?: Message['tone']; children?: ReactNode }) {
    if (!children) return null;
    return <div className={`message message--${tone}`}>{children}</div>;
}

function Field({ label, name, type = 'text', required, value, onChange, placeholder }: FieldProps) {
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

function SignupForm({ onSubmit, busy, message }: { onSubmit: (data: typeof initialSignup, reset: () => void) => void; busy: boolean; message?: Message }) {
    const [form, setForm] = useState<typeof initialSignup>(initialSignup);

    const handleChange = (name: string, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(form, () => setForm(initialSignup));
    };

    return (
        <Card title="Registrieren">
            <form className="stack" onSubmit={submit}>
                <div className="grid two">
                    <Field label="Vorname" name="first_name" required value={form.first_name} onChange={handleChange} />
                    <Field label="Nachname" name="last_name" required value={form.last_name} onChange={handleChange} />
                </div>
                <div className="grid two">
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
                <div className="grid two">
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

function LoginForm({ onSubmit, busy, message }: { onSubmit: (data: { email: string; password: string }, reset: () => void) => void; busy: boolean; message?: Message }) {
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
                    {busy ? 'Wird geprüft...' : 'Einloggen'}
                </button>
            </form>
        </Card>
    );
}

function ProfileView({ profile, refresh }: { profile: Profile | null; refresh: () => void }) {
    const age = useMemo(() => calculateAge(profile?.birth_date), [profile]);
    const missingPhone = !profile?.phone;
    const missingImage = !profile?.profile_image;
    const missing = [missingPhone && 'Handynummer', missingImage && 'Profilbild'].filter(Boolean).join(' & ');

    return (
        <Card
            title="Profil"
            footer={
                <div className="card__footer-row">
                    <span className="muted">Token wird lokal gespeichert.</span>
                    <button className="btn ghost" type="button" onClick={refresh}>
                        Profil neu laden
                    </button>
                </div>
            }
        >
            {!profile ? (
                <p className="muted">Noch kein Profil geladen.</p>
            ) : (
                <div className="profile">
                    <div className="profile__avatar" aria-label="Profilbild">
                        {profile.profile_image ? <img src={profile.profile_image} alt="Profilbild" /> : <span>Kein Bild</span>}
                    </div>
                    <dl>
                        <div>
                            <dt>Vorname</dt>
                            <dd>{profile.first_name}</dd>
                        </div>
                        <div>
                            <dt>Nachname</dt>
                            <dd>{profile.last_name ? `${profile.last_name[0]}.` : '–'}</dd>
                        </div>
                        <div>
                            <dt>Alter</dt>
                            <dd>{age ?? '–'}</dd>
                        </div>
                        <div>
                            <dt>E-Mail</dt>
                            <dd>{profile.email}</dd>
                        </div>
                        <div>
                            <dt>Handy (intern)</dt>
                            <dd>{profile.phone || 'nicht hinterlegt'}</dd>
                        </div>
                        <div>
                            <dt>Notiz</dt>
                            <dd>{profile.additional_note || '–'}</dd>
                        </div>
                    </dl>
                </div>
            )}
            {missing && <MessageBox tone="warn">Für Angebote fehlen noch: {missing}</MessageBox>}
        </Card>
    );
}

function OfferPrereqForm({ profile, onSubmit, busy, message }: { profile: Profile | null; onSubmit: (data: UpdateProfileInput) => void; busy: boolean; message?: Message }) {
    const [form, setForm] = useState<UpdateProfileInput>(initialUpdate);

    useEffect(() => {
        if (profile) {
            setForm({
                phone: profile.phone || '',
                profile_image: profile.profile_image || '',
                additional_note: profile.additional_note || '',
            });
        }
    }, [profile]);

    const handleChange = (name: string, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Card title="Pflichtangaben für Angebote">
            <form className="stack" onSubmit={submit}>
                <Field
                    label="Handynummer (intern)"
                    name="phone"
                    required
                    value={form.phone || ''}
                    onChange={handleChange}
                />
                <Field
                    label="Profilbild-URL"
                    name="profile_image"
                    required
                    value={form.profile_image || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                />
                <label className="field">
                    <span>Notiz</span>
                    <textarea
                        name="additional_note"
                        value={form.additional_note || ''}
                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                        rows={3}
                    />
                </label>
                <MessageBox tone={message?.tone}>{message?.text}</MessageBox>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? 'Speichern...' : 'Speichern & Angebot erstellen können'}
                </button>
            </form>
        </Card>
    );
}

export default function App() {
    const [token, setToken] = useState<string>(() => localStorage.getItem(storageKey) || '');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [busy, setBusy] = useState(false);
    const [signupMessage, setSignupMessage] = useState<Message>();
    const [loginMessage, setLoginMessage] = useState<Message>();
    const [updateMessage, setUpdateMessage] = useState<Message>();

    useEffect(() => {
        if (!token) return;
        fetchProfile(token)
            .then(setProfile)
            .catch((err: Error) => setLoginMessage({ tone: 'error', text: err.message }));
    }, [token]);

    const handleSignup = async (form: typeof initialSignup, reset: () => void) => {
        setSignupMessage(undefined);
        setBusy(true);
        try {
            if (form.email !== form.emailConfirm) {
                throw new Error('E-Mail und Bestätigung stimmen nicht überein.');
            }
            const age = calculateAge(form.birth_date);
            if (age === null || age < 18) {
                throw new Error('Du musst mindestens 18 Jahre alt sein.');
            }

            await signupUser({
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                birth_date: new Date(form.birth_date).toISOString(),
                phone: form.phone || null,
                profile_image: form.profile_image || null,
                additional_note: form.additional_note || null,
            });

            setSignupMessage({ tone: 'success', text: 'Registrierung erfolgreich! Bitte jetzt einloggen.' });
            reset();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            setSignupMessage({ tone: 'error', text: message });
        } finally {
            setBusy(false);
        }
    };

    const handleLogin = async ({ email, password }: { email: string; password: string }, reset: () => void) => {
        setLoginMessage(undefined);
        setBusy(true);
        try {
            const newToken = await loginUser(email, password);
            localStorage.setItem(storageKey, newToken);
            setToken(newToken);
            setLoginMessage({ tone: 'success', text: 'Login erfolgreich. Profil wird geladen...' });
            reset();
            const fetched = await fetchProfile(newToken);
            setProfile(fetched);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            setLoginMessage({ tone: 'error', text: message });
        } finally {
            setBusy(false);
        }
    };

    const handleUpdate = async (data: UpdateProfileInput) => {
        setUpdateMessage(undefined);
        if (!token) {
            setUpdateMessage({ tone: 'error', text: 'Bitte zuerst einloggen.' });
            return;
        }
        setBusy(true);
        try {
            const updated = await updateProfile(data, token);
            setProfile(updated);
            setUpdateMessage({ tone: 'success', text: 'Daten gespeichert. Angebote können erstellt werden.' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            setUpdateMessage({ tone: 'error', text: message });
        } finally {
            setBusy(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(storageKey);
        setToken('');
        setProfile(null);
        setLoginMessage({ tone: 'info', text: 'Abgemeldet.' });
    };

    return (
        <div className="page">
            <header className="page__header">
                <div>
                    <p className="eyebrow">MyCargonaut</p>
                    <h1>Registrierung & Login</h1>
                    <p className="muted">Vite + React (TSX) UI gegen das vorhandene GraphQL-Backend.</p>
                </div>
                <div className="session">
                    <span className="badge">{token ? 'Session aktiv' : 'nicht eingeloggt'}</span>
                    {token ? (
                        <button type="button" className="btn ghost" onClick={logout}>
                            Logout
                        </button>
                    ) : null}
                </div>
            </header>

            <main className="layout">
                <div className="layout__column">
                    <SignupForm onSubmit={handleSignup} busy={busy} message={signupMessage} />
                    <OfferPrereqForm
                        profile={profile}
                        onSubmit={handleUpdate}
                        busy={busy}
                        message={updateMessage}
                    />
                </div>
                <div className="layout__column">
                    <LoginForm onSubmit={handleLogin} busy={busy} message={loginMessage} />
                    <ProfileView
                        profile={profile}
                        refresh={() => {
                            if (!token) return;
                            fetchProfile(token).then(setProfile);
                        }}
                    />
                </div>
            </main>
        </div>
    );
}