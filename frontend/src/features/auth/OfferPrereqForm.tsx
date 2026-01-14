import { FormEvent, useEffect, useState } from 'react';
import { Profile, UpdateProfileInput } from '../../app/api';
import Card from '../../components/ui/Card';
import Field from '../../components/ui/Field';
import MessageBox from '../../components/ui/MessageBox';
import type { Message } from './types';

const initialUpdate: UpdateProfileInput = {
    phone: '',
    profile_image: '',
    additional_note: '',
};

type OfferPrereqFormProps = {
    profile: Profile | null;
    onSubmit: (data: UpdateProfileInput) => void;
    busy: boolean;
    message?: Message;
};

export default function OfferPrereqForm({ profile, onSubmit, busy, message }: OfferPrereqFormProps) {
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
        <Card title="Pflichtangaben fÇ¬r Angebote">
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
                    {busy ? 'Speichern...' : 'Speichern & Angebot erstellen kÇônnen'}
                </button>
            </form>
        </Card>
    );
}
