import { useEffect, useState } from 'react';
import {
    Profile,
    UpdateProfileInput,
    Vehicle,
    calculateAge,
    fetchMyVehicles,
    fetchProfile,
    loginUser,
    signupUser,
    updateProfile,
} from '../app/api';
import Card from '../components/ui/Card';
import LoginForm from '../features/auth/LoginForm';
import OfferPrereqForm from '../features/auth/OfferPrereqForm';
import ProfileView from '../features/auth/ProfileView';
import SignupForm, { SignupFormData } from '../features/auth/SignupForm';
import VehicleManager from '../features/auth/VehicleManager';
import type { Message } from '../features/auth/types';

const storageKey = 'cargonaut-token';

export default function AuthPage() {
    const [token, setToken] = useState<string>(() => localStorage.getItem(storageKey) || '');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

    useEffect(() => {
        if (!token) {
            setVehicles([]);
            return;
        }
        fetchMyVehicles(token)
            .then(setVehicles)
            .catch((err: Error) => setUpdateMessage({ tone: 'error', text: err.message }));
    }, [token]);

    const handleSignup = async (form: SignupFormData, reset: () => void) => {
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

    const refreshVehicles = () => {
        if (!token) return;
        fetchMyVehicles(token).then(setVehicles).catch(() => {
            setUpdateMessage({ tone: 'error', text: 'Fahrzeuge konnten nicht geladen werden.' });
        });
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
                    <OfferPrereqForm profile={profile} onSubmit={handleUpdate} busy={busy} message={updateMessage} />
                    {token ? (
                        <VehicleManager token={token} vehicles={vehicles} onRefresh={refreshVehicles} />
                    ) : (
                        <Card title="Fahrzeugverwaltung">
                            <p className="muted">Bitte einloggen, um Fahrzeuge zu verwalten.</p>
                        </Card>
                    )}
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
