import { useEffect, useState } from 'react';
import {
    Profile,
    UpdateProfileInput,
    Vehicle,
    fetchMyVehicles,
    fetchProfile,
    loginUser,
    signupUser,
    updateProfile,
} from '../app/api';
import Card from '../components/ui/Card';
import LoginForm from '../features/LoginForm';
import OfferPrereqForm from '../features/OfferPrereqForm';
import ProfileView from '../features/ProfileView';
import SignupForm, { SignupFormData, getSignupValidationError, toSignupInput } from '../features/SignupForm';
import VehicleManager from '../features/VehicleManager';
import { PageFooter, PageLayout } from '../components/PageLayout';
import type { Message } from '../features/types';

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
            const validationError = getSignupValidationError(form);
            if (validationError) {
                throw new Error(validationError);
            }

            await signupUser(toSignupInput(form));

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
            window.dispatchEvent(new Event("auth-changed"));
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
        window.dispatchEvent(new Event("auth-changed"));
        setToken('');
        setProfile(null);
        setLoginMessage({ tone: 'info', text: 'Abgemeldet.' });
    };

    // Sammelseite nutzt das Template fuer Header und Layout-Rahmen.
    return (
        <PageLayout
            as="div"
            header={{
                eyebrow: 'MyCargonaut',
                title: 'Registrierung & Login',
                subtitle: 'Vite + React (TSX) UI gegen das vorhandene GraphQL-Backend.',
                actions: (
                    <>
                        <span className="badge">{token ? 'Session aktiv' : 'nicht eingeloggt'}</span>
                        {token ? (
                            <button type="button" className="btn btn--ghost" onClick={logout}>
                                Logout
                            </button>
                        ) : null}
                    </>
                ),
            }}
            footer={<PageFooter className="page__footer--sm" />}
        >
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
        </PageLayout>
    );
}
