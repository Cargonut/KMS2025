const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql';

export type Profile = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: string;
    phone?: string | null;
    profile_image?: string | null;
    additional_note?: string | null;
};

export function calculateAge(dateString: string | null | undefined): number | null {
    if (!dateString) return null;
    const today = new Date();
    const birth = new Date(dateString);
    if (Number.isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age;
}

export async function graphqlRequest<T>(query: string, variables: Record<string, unknown> = {}, token?: string): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();
    if (payload.errors?.length) {
        throw new Error(payload.errors[0].message || 'Unbekannter Fehler');
    }
    return payload.data as T;
}

export type SignupInput = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date: string;
    phone?: string | null;
    profile_image?: string | null;
    additional_note?: string | null;
};

export async function signupUser(data: SignupInput): Promise<void> {
    await graphqlRequest(
        `mutation Signup($data: CreateUserInput!) {
      signup(data: $data) { id email first_name last_name }
    }`,
        { data },
    );
}

export async function loginUser(email: string, password: string): Promise<string> {
    const result = await graphqlRequest<{ login: { token: string } }>(
        `mutation Login($data: LoginInput!) {
      login(data: $data) {
        token
      }
    }`,
        { data: { email, password } },
    );
    return result.login.token;
}

export async function fetchProfile(token: string): Promise<Profile> {
    const result = await graphqlRequest<{ me: Profile }>(
        `query Me {
      me {
        id
        first_name
        last_name
        email
        birth_date
        phone
        profile_image
        additional_note
      }
    }`,
        {},
        token,
    );
    return result.me;
}

export type UpdateProfileInput = Pick<Profile, 'phone' | 'profile_image' | 'additional_note'>;

export async function updateProfile(data: UpdateProfileInput, token: string): Promise<Profile> {
    const result = await graphqlRequest<{ updateMe: Profile }>(
        `mutation UpdateMe($data: UpdateUserInput!) {
      updateMe(data: $data) {
        id
        phone
        profile_image
        additional_note
        first_name
        last_name
        email
        birth_date
      }
    }`,
        { data },
        token,
    );
    return result.updateMe;
}