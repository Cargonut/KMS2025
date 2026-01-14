import { useMemo } from 'react';
import { Profile, calculateAge } from '../app/api';
import Card from '../components/ui/Card';
import MessageBox from '../components/ui/MessageBox';

type ProfileViewProps = {
    profile: Profile | null;
    refresh: () => void;
};

export default function ProfileView({ profile, refresh }: ProfileViewProps) {
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
                    <button className="btn btn--ghost" type="button" onClick={refresh}>
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
                            <dd>{profile.last_name ? `${profile.last_name[0]}.` : 'k.A.'}</dd>
                        </div>
                        <div>
                            <dt>Alter</dt>
                            <dd>{age ?? 'k.A.'}</dd>
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
                            <dd>{profile.additional_note || 'k.A.'}</dd>
                        </div>
                    </dl>
                </div>
            )}
            {missing && <MessageBox tone="warn">Für Angebote fehlen noch: {missing}</MessageBox>}
        </Card>
    );
}
