export type UserRole = "SUPER_ADMIN" | "ADMIN" | "ORGANIZER" | "EVENT_STAFF" | "ATTENDEE";
export type Currency = "BDT" | "USD";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  mustChangePassword?: boolean;
  imageUrl?: string;
  phone?: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface TicketType {
  id: string;
  eventId?: string;
  name: string;
  description?: string;
  price: number | string;
  quantity: number;
  soldQuantity?: number;
  reservedQuantity?: number;
  maxPerOrder?: number;
  saleStartAt?: string;
  saleEndAt?: string;
  transferable?: boolean;
  refundable?: boolean;
  benefits?: string[];
  isVisible?: boolean;
}

export interface EventItem {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  venueName?: string;
  venueAddress?: string;
  startDateTime: string;
  endDateTime: string;
  entryOpenTime?: string;
  saleStartAt?: string;
  saleEndAt?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  currency: Currency;
  status?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
  category?: Category;
  categoryId?: string;
  organizer?: { id: string; organizationName?: string };
  ticketTypes?: TicketType[];
  reviews?: Array<Record<string, unknown>>;
}

export type AnyRecord = Record<string, any>;
