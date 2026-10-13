import api from './api';
import type {
  User,
  AuthResponse,
  Treatment,
  Appointment,
  AppointmentRequest,
  PriceCalculation,
  MembershipPlan,
  UserMembership,
  Review,
  ReviewRequest,
  ContactEnquiry,
  AppointmentStatus,
} from '../types';

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; confirmPassword?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};

export const treatmentsApi = {
  getAll: () =>
    api.get<Treatment[]>('/treatments'),
  getById: (id: number) =>
    api.get<Treatment>(`/treatments/${id}`),
  create: (data: Partial<Treatment>) =>
    api.post<Treatment>('/admin/treatments', data),
  update: (id: number, data: Partial<Treatment>) =>
    api.put<Treatment>(`/admin/treatments/${id}`, data),
  delete: (id: number) =>
    api.delete<void>(`/admin/treatments/${id}`),
};

export const appointmentsApi = {
  calculatePrice: (treatmentId: number) =>
    api.get<PriceCalculation>(`/appointments/calculate-price?treatmentId=${treatmentId}`),
  book: (data: AppointmentRequest) =>
    api.post<Appointment>('/appointments', data),
  getMy: () =>
    api.get<Appointment[]>('/appointments/my'),
  getById: (id: number) =>
    api.get<Appointment>(`/appointments/${id}`),
  cancel: (id: number) =>
    api.patch<Appointment>(`/appointments/${id}/cancel`),
  getAllAdmin: () =>
    api.get<Appointment[]>('/admin/appointments'),
  updateStatus: (id: number, status: AppointmentStatus) =>
    api.patch<Appointment>(`/admin/appointments/${id}/status`, { status }),
};

export const membershipsApi = {
  getPlans: () =>
    api.get<MembershipPlan[]>('/memberships/plans'),
  getMyActive: () =>
    api.get<UserMembership>('/memberships/my'),
  getMyHistory: () =>
    api.get<UserMembership[]>('/memberships/my/history'),
  activate: (planId: number, demoActivation = true) =>
    api.post<UserMembership>('/memberships/activate', { planId, demoActivation }),
};

export const reviewsApi = {
  getAll: (treatmentId?: number) =>
    api.get<Review[]>(treatmentId ? `/reviews?treatmentId=${treatmentId}` : '/reviews'),
  getMy: () =>
    api.get<Review[]>('/reviews/my'),
  submit: (data: ReviewRequest) =>
    api.post<Review>('/reviews', data),
};

export const contactApi = {
  submit: (data: ContactEnquiry) =>
    api.post<ContactEnquiry>('/contact', data),
  getMy: () =>
    api.get<ContactEnquiry[]>('/contact/my'),
  getByEmail: (email: string) =>
    api.get<ContactEnquiry[]>(`/contact/by-email?email=${encodeURIComponent(email)}`),
};

export const adminApi = {
  // stats
  getStats: () => api.get<Record<string, number>>('/admin/stats'),
  // appointments
  getAllAppointments: () => api.get<Appointment[]>('/admin/appointments'),
  getPendingAppointments: () => api.get<Appointment[]>('/admin/appointments/pending'),
  updateAppointmentStatus: (id: number, status: AppointmentStatus) =>
    api.patch<Appointment>(`/admin/appointments/${id}/status`, { status }),
  // memberships
  getActiveMemberships: () => api.get<any[]>('/admin/memberships'),
  deactivateMembership: (id: number) =>
    api.patch<{ message: string }>(`/admin/memberships/${id}/deactivate`),
  getAllMembershipPlans: () => api.get<MembershipPlan[]>('/admin/membership-plans'),
  createMembershipPlan: (plan: Partial<MembershipPlan>) =>
    api.post<MembershipPlan>('/admin/membership-plans', plan),
  deleteMembershipPlan: (id: number) =>
    api.delete<{ message: string }>(`/admin/membership-plans/${id}`),
  // messages
  getMessages: () => api.get<any[]>('/admin/messages'),
  markMessageRead: (id: number) => api.patch<any>(`/admin/messages/${id}/read`),
  replyToMessage: (id: number, reply: string) =>
    api.patch<ContactEnquiry>(`/admin/messages/${id}/reply`, { reply }),
  // reviews
  getReviews: () => api.get<any[]>('/admin/reviews'),
};
