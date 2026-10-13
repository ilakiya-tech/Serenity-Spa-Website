export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  fullName: string;
  email: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_ADMIN';
}

export interface Treatment {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imagePath?: string;
  active: boolean;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  treatmentId: number;
  treatmentName: string;
  appointmentDate: string;
  startTime: string;
  status: AppointmentStatus;
  notes?: string;
  originalPrice: number;
  discountAmount: number;
  membershipDiscountApplied: boolean;
  discountPercentage: number;
  finalPrice: number;
  reviewed: boolean;
  reviewId?: number;
  createdAt: string;
}

export interface AppointmentRequest {
  treatmentId: number;
  appointmentDate: string;
  startTime: string;
  notes?: string;
}

export interface PriceCalculation {
  treatmentId: number;
  treatmentName: string;
  originalPrice: number;
  membershipActive: boolean;
  membershipPlanName?: string;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  discountPercentage: number;
  benefits: string;
  active: boolean;
}

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface UserMembership {
  id: number;
  planId: number;
  planName: string;
  price: number;
  discountPercentage: number;
  benefits: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  activeNow: boolean;
}

export interface Review {
  id: number;
  appointmentId: number;
  customerId: number;
  customerName: string;
  treatmentId: number;
  treatmentName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewRequest {
  appointmentId: number;
  rating: number;
  comment?: string;
}

export interface ContactEnquiry {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt?: string;
  read?: boolean;
  reply?: string;
  repliedAt?: string;
  status?: string;
}
