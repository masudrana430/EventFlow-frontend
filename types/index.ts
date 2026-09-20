export type UserRole = "SUPER_ADMIN" | "ADMIN" | "ORGANIZER" | "EVENT_STAFF" | "ATTENDEE";
export interface AuthUser { id: string; name: string; email: string; role: UserRole; mustChangePassword?: boolean; imageUrl?: string; }
export interface ApiResponse<T> { success: boolean; statusCode: number; message: string; data: T; }
export interface LoginResponse { accessToken: string; refreshToken: string; user: AuthUser; }
