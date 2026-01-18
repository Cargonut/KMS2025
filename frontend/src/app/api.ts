const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/graphql";
const API_BASE_URL = API_URL.replace(/\/graphql\/?$/, "");

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  phone?: string | null;
  profile_image?: string | null;
  additional_note?: string | null;
  balance?: number | null;
};

export type MotorType = "benzin" | "diesel" | "hybrid" | "elektro" | "gas" | "sonstiges";

export type TripType = "angebot" | "gesuch";

export type Vehicle = {
  id: number;
  user_id?: number | null;
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
  user_id: number;
  from_location: string;
  to_location: string;
  start_date: string;
  end_date?: string | null;
  vehicle_id?: number | null;
  weight?: number | null;
  seats?: number | null;
  price?: number | null;
  is_active: boolean;
  restrictions?: string | null;
  vehicle?: Vehicle | null;
};

export type TripPassenger = {
  id: number;
  trip_id: number;
  passenger_id: number;
  joined_at: string;
  status: string;
  trip?: Trip | null;
  payments?: Payment[];
};

export type Payment = {
  id: number;
  trip_passenger_id: number;
  amount: number;
  status: string; // ausstehend | bezahlt | storniert | fehlgeschlagen
  payment_method?: string | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
  trip_passenger?: TripPassenger | null;
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

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message || "Unbekannter Fehler");
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
        balance
      }
    }`,
    {},
    token,
  );
  return result.me;
}

export type UpdateProfileInput = Pick<Profile, "phone" | "profile_image" | "additional_note">;

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
        balance
      }
    }`,
    { data },
    token,
  );
  return result.updateMe;
}

export async function updateBalance(amount: number, token: string): Promise<Profile> {
  const result = await graphqlRequest<{ updateBalance: Profile }>(
    `mutation UpdateBalance($amount: Float!) {
      updateBalance(amount: $amount) {
        id
        balance
        first_name
        last_name
        email
      }
    }`,
    { amount },
    token,
  );
  return result.updateBalance;
}

export async function setBalance(balance: number, token: string): Promise<Profile> {
  const result = await graphqlRequest<{ setBalance: Profile }>(
    `mutation SetBalance($balance: Float!) {
      setBalance(balance: $balance) {
        id
        balance
        first_name
        last_name
        email
      }
    }`,
    { balance },
    token,
  );
  return result.setBalance;
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
          user_id
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
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Expected Iterable")) {
      try {
        const profile = await fetchProfile(token);
        const userId = Number(profile.id);
        if (!Number.isFinite(userId)) {
          return [];
        }
        const allVehicles = await fetchVehicles();
        return allVehicles.filter((vehicle) => Number(vehicle.user_id) === userId);
      } catch {
        return [];
      }
    }
    throw err;
  }
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const result = await graphqlRequest<{ vehicles?: Vehicle[] | null }>(
    `query Vehicles {
      vehicles {
        id
        user_id
        name
        load_area
        motor_type
        image_urls
        special_features
        weight
        dimensions
      }
    }`,
  );
  return result.vehicles ?? [];
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

export async function updateVehicle(
  id: number | string,
  data: UpdateVehicleInput,
  token: string,
): Promise<void> {
  const numericId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Fahrzeug-ID.");
  }
  await graphqlRequest<{ updateVehicle: { __typename: string } }>(
    `mutation UpdateVehicle($id: Int!, $data: UpdateVehicleInput!) {
      updateVehicle(id: $id, data: $data) {
        __typename
      }
    }`,
    { id: numericId, data },
    token,
  );
}

export async function fetchTrips(): Promise<Trip[]> {
  const result = await graphqlRequest<{ trips?: Trip[] | null }>(
    `query Trips {
      trips {
        id
        type
        user_id
        from_location
        to_location
        start_date
        end_date
        vehicle_id
        weight
        seats
        price
        is_active
        restrictions
        vehicle {
          id
          name
          motor_type
          load_area
          weight
          image_urls
        }
      }
    }`,
  );
  return result.trips ?? [];
}

export async function fetchMyTripBookings(token: string): Promise<TripPassenger[]> {
  const result = await graphqlRequest<{ myTripBookings?: TripPassenger[] | null }>(
    `query MyTripBookings {
      myTripBookings {
        id
        trip_id
        passenger_id
        joined_at
        status
        trip {
          id
          type
          user_id
          from_location
          to_location
          start_date
          end_date
          vehicle_id
          weight
          seats
          price
          is_active
          restrictions
          vehicle {
            id
            name
            motor_type
            load_area
            weight
            image_urls
          }
        }
      }
    }`,
    {},
    token,
  );
  return result.myTripBookings ?? [];
}

export async function bookTrip(tripId: number | string, token: string): Promise<TripPassenger> {
  const numericId = typeof tripId === "string" ? Number(tripId) : tripId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Fahrt-ID.");
  }
  const result = await graphqlRequest<{ bookTrip: TripPassenger }>(
    `mutation BookTrip($tripId: Int!) {
      bookTrip(tripId: $tripId) {
        id
        trip_id
        passenger_id
        joined_at
        status
      }
    }`,
    { tripId: numericId },
    token,
  );
  return result.bookTrip;
}

export async function deleteTrip(id: number | string, token: string): Promise<boolean> {
  const numericId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Fahrt-ID.");
  }
  const result = await graphqlRequest<{ deleteTrip: boolean }>(
    `mutation DeleteTrip($id: Int!) {
      deleteTrip(id: $id)
    }`,
    { id: numericId },
    token,
  );
  return result.deleteTrip;
}

export async function deleteVehicle(id: number | string, token: string): Promise<boolean> {
  const numericId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Fahrzeug-ID.");
  }
  const result = await graphqlRequest<{ deleteVehicle: boolean }>(
    `mutation DeleteVehicle($id: Int!) {
      deleteVehicle(id: $id)
    }`,
    { id: numericId },
    token,
  );
  return result.deleteVehicle;
}

export async function deleteMe(password: string, token: string): Promise<boolean> {
  const result = await graphqlRequest<{ deleteMe: boolean }>(
    `mutation DeleteMe($password: String!) {
      deleteMe(password: $password)
    }`,
    { password },
    token,
  );
  return result.deleteMe;
}

export async function uploadVehicleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/vehicle`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload fehlgeschlagen.");
  }

  const payload: { url: string } = await response.json();
  return `${API_BASE_URL}${payload.url}`;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/profile`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload fehlgeschlagen.");
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
        user_id
        from_location
        to_location
        start_date
        end_date
        vehicle_id
        is_active
        restrictions
        price
        seats
      }
    }`,
    { data },
    token,
  );
  return result.createTrip;
}

export async function createPayment(
  bookingId: number | string,
  amount: number,
  token: string,
  paymentMethod?: string,
): Promise<Payment> {
  const numericId = typeof bookingId === "string" ? Number(bookingId) : bookingId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Buchungs-ID.");
  }
  const result = await graphqlRequest<{ createPayment: Payment }>(
    `mutation CreatePayment($bookingId: Int!, $amount: Float!, $paymentMethod: String) {
      createPayment(bookingId: $bookingId, amount: $amount, paymentMethod: $paymentMethod) {
        id
        trip_passenger_id
        amount
        status
        payment_method
        transaction_id
        paid_at
        created_at
        updated_at
      }
    }`,
    { bookingId: numericId, amount, paymentMethod },
    token,
  );
  return result.createPayment;
}

export async function confirmPayment(paymentId: number | string, token: string): Promise<Payment> {
  const numericId = typeof paymentId === "string" ? Number(paymentId) : paymentId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Zahlungs-ID.");
  }
  const result = await graphqlRequest<{ confirmPayment: Payment }>(
    `mutation ConfirmPayment($paymentId: Int!) {
      confirmPayment(paymentId: $paymentId) {
        id
        trip_passenger_id
        amount
        status
        payment_method
        transaction_id
        paid_at
        created_at
        updated_at
      }
    }`,
    { paymentId: numericId },
    token,
  );
  return result.confirmPayment;
}

export async function cancelPayment(paymentId: number | string, token: string): Promise<Payment> {
  const numericId = typeof paymentId === "string" ? Number(paymentId) : paymentId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Zahlungs-ID.");
  }
  const result = await graphqlRequest<{ cancelPayment: Payment }>(
    `mutation CancelPayment($paymentId: Int!) {
      cancelPayment(paymentId: $paymentId) {
        id
        trip_passenger_id
        amount
        status
        payment_method
        transaction_id
        paid_at
        created_at
        updated_at
      }
    }`,
    { paymentId: numericId },
    token,
  );
  return result.cancelPayment;
}

export async function fetchPaymentsByBooking(
  bookingId: number | string,
  token: string,
): Promise<Payment[]> {
  const numericId = typeof bookingId === "string" ? Number(bookingId) : bookingId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Buchungs-ID.");
  }
  const result = await graphqlRequest<{ paymentsByBooking?: Payment[] | null }>(
    `query PaymentsByBooking($bookingId: Int!) {
      paymentsByBooking(bookingId: $bookingId) {
        id
        trip_passenger_id
        amount
        status
        payment_method
        transaction_id
        paid_at
        created_at
        updated_at
      }
    }`,
    { bookingId: numericId },
    token,
  );
  return result.paymentsByBooking ?? [];
}

export async function fetchMyPayments(token: string): Promise<Payment[]> {
  const result = await graphqlRequest<{ myPayments?: Payment[] | null }>(
    `query MyPayments {
      myPayments {
        id
        trip_passenger_id
        amount
        status
        payment_method
        transaction_id
        paid_at
        created_at
        updated_at
      }
    }`,
    {},
    token,
  );
  return result.myPayments ?? [];
}

export async function cancelBooking(bookingId: number | string, token: string): Promise<TripPassenger> {
  const numericId = typeof bookingId === "string" ? Number(bookingId) : bookingId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Buchungs-ID.");
  }
  const result = await graphqlRequest<{ cancelBooking: TripPassenger }>(
    `mutation CancelBooking($bookingId: Int!) {
      cancelBooking(bookingId: $bookingId) {
        id
        trip_id
        passenger_id
        joined_at
        status
      }
    }`,
    { bookingId: numericId },
    token,
  );
  return result.cancelBooking;
}

export async function completeBooking(bookingId: number | string, token: string): Promise<TripPassenger> {
  const numericId = typeof bookingId === "string" ? Number(bookingId) : bookingId;
  if (!Number.isFinite(numericId)) {
    throw new Error("Ungültige Buchungs-ID.");
  }
  const result = await graphqlRequest<{ completeBooking: TripPassenger }>(
    `mutation CompleteBooking($bookingId: Int!) {
      completeBooking(bookingId: $bookingId) {
        id
        trip_id
        passenger_id
        joined_at
        status
      }
    }`,
    { bookingId: numericId },
    token,
  );
  return result.completeBooking;
}
