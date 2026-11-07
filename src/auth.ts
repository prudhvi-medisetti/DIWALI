import { profiles, type PrivateProfile } from './profiles';

export async function authenticatePin(pin: string): Promise<PrivateProfile | null> {
  if (!/^\d{4}$/.test(pin)) return null;
  return profiles.find((profile) => profile.pin === pin) ?? null;
}
