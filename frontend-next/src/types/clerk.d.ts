// Augment Clerk's publicMetadata type so user.publicMetadata.role is typed everywhere.
export {};

interface UserPublicMetadata {
  role?: "admin" | "teacher" | "student";
  avatar?: string;
}
