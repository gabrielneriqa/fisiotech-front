export type AvatarTint = 'blue' | 'orange' | 'green' | 'purple';

const TINTS: AvatarTint[] = ['blue', 'orange', 'green', 'purple'];

export function avatarTint(seed: string): AvatarTint {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}
