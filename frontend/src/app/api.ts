const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql';
const API_BASE_URL = API_URL.replace(/\/graphql\/?$/, '');

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

export type MotorType = 'benzin' | 'diesel' | 'hybrid' | 'elektro' | 'gas' | 'sonstiges';

export type TripType = 'angebot' | 'gesuch';

export type Vehicle = {
    id: number;
    name?: string | null;
    special_features?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    load_area?: number | null;
    motor_type?: MotorType | null;
    image_urls?: string[];
};

export type Trip = {
    id: number;
    type: TripType;
    from_location: string;
    to_location: string;
    start_date: string;
    end_date?: string | null;
    vehicle_id?: number | null;
    is_active: boolean;
    restrictions?: string | null;
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

export type CreateVehicleInput = {
    name: string;
    load_area: number;
    motor_type: MotorType;
    special_features?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    image_urls?: string[];
};

export type UpdateVehicleInput = {
    name?: string;
    load_area?: number | null;
    motor_type?: MotorType | null;
    special_features?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    image_urls?: string[] | null;
};

export type CreateTripInput = {
    type: TripType;
    from_location: string;
    to_location: string;
    start_date: string;
    end_date?: string | null;
    vehicle_id?: number | null;
    weight?: number | null;
    seats?: number | null;
    price?: number | null;
    restrictions?: string | null;
};

export async function fetchMyVehicles(token: string): Promise<Vehicle[]> {
    try {
        const result = await graphqlRequest<{ myVehicles?: Vehicle[] | null }>(
            `query MyVehicles {
        myVehicles {
          id
          name
          load_area
          motor_type
          image_urls
          special_features
          weight
          dimensions
        }
      }`,
            {},
            token,
        );
        return result.myVehicles ?? [];
    } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('Expected Iterable')) {
            return [];
        }
        throw err;
    }
}

export async function createVehicle(data: CreateVehicleInput, token: string): Promise<void> {
    await graphqlRequest<{ createVehicle: { __typename: string } }>(
        `mutation CreateVehicle($data: CreateVehicleInput!) {
      createVehicle(data: $data) {
        __typename
      }
    }`,
        { data },
        token,
    );
}

export async function updateVehicle(id: number, data: UpdateVehicleInput, token: string): Promise<void> {
    await graphqlRequest<{ updateVehicle: { __typename: string } }>(
        `mutation UpdateVehicle($id: Int!, $data: UpdateVehicleInput!) {
      updateVehicle(id: $id, data: $data) {
        __typename
      }
    }`,
        { id, data },
        token,
    );
}

export async function deleteVehicle(id: number, token: string): Promise<boolean> {
    const result = await graphqlRequest<{ deleteVehicle: boolean }>(
        `mutation DeleteVehicle($id: Int!) {
      deleteVehicle(id: $id)
    }`,
        { id },
        token,
    );
    return result.deleteVehicle;
}

export async function uploadVehicleImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/vehicle`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload fehlgeschlagen.');
    }

    const payload: { url: string } = await response.json();
    return `${API_BASE_URL}${payload.url}`;
}

export async function uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/profile`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload fehlgeschlagen.');
    }

    const payload: { url: string } = await response.json();
    return `${API_BASE_URL}${payload.url}`;
}

export async function createTrip(data: CreateTripInput, token: string): Promise<Trip> {
    const result = await graphqlRequest<{ createTrip: Trip }>(
        `mutation CreateTrip($data: CreateTripInput!) {
      createTrip(data: $data) {
        id
        type
        from_location
        to_location
        start_date
        end_date
        vehicle_id
        is_active
        restrictions
      }
    }`,
        { data },
        token,
    );
    return result.createTrip;
}
