const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAuthTokens(args: { accessToken?: string; token?: string; refreshToken?: string }) {
  if (typeof window === "undefined") return;
  const t = args.accessToken ?? args.token;
  if (t) localStorage.setItem(ACCESS_TOKEN_KEY, t);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
  if ("refreshToken" in args) {
    const r = args.refreshToken;
    if (r) localStorage.setItem(REFRESH_TOKEN_KEY, r);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface ApiErrorShape { status: number; message: string; }

async function apiFetch<T>(path: string, options: RequestInit & { method?: ApiMethod } = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("Missing env: NEXT_PUBLIC_API_BASE_URL");
  const token = getToken();
  const hasBody = typeof options.body !== "undefined";
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const raw = await res.text();
  const ct = res.headers.get("content-type") || "";
  const defaultByStatus = (s: number) =>
    s === 400 ? "Yêu cầu không hợp lệ."
      : s === 401 ? "Bạn chưa đăng nhập hoặc phiên đã hết hạn."
        : s === 403 ? "Bạn không có quyền thực hiện hành động này."
          : s === 404 ? "Không tìm thấy tài nguyên."
            : s >= 500 ? "Lỗi hệ thống. Vui lòng thử lại sau."
              : `Yêu cầu thất bại (HTTP ${s}).`;
  if (!res.ok) {
    let message = defaultByStatus(res.status);
    if (ct.includes("application/json") && raw) {
      try {
        const j = JSON.parse(raw);
        message = j?.detail || j?.title || j?.message || j?.error || message;
      } catch {}
    } else if (raw) {
      message = raw.replace(/<[^>]+>/g, "").trim().slice(0, 180) || message;
    }
    const error: ApiErrorShape = { status: res.status, message };
    throw error;
  }
  if (!raw) return undefined as unknown as T;
  return JSON.parse(raw) as T;
}

export function getJson<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(path, { ...(init ?? {}), method: "GET" });
}

export function putJson<TReq, TRes>(path: string, body: TReq, init?: RequestInit) {
  return apiFetch<TRes>(path, { ...(init ?? {}), method: "PUT", body: JSON.stringify(body) });
}

export function delJson<TRes>(path: string, init?: RequestInit) {
  return apiFetch<TRes>(path, { ...(init ?? {}), method: "DELETE" });
}

function postJson<TReq, TRes>(path: string, body: TReq, init?: RequestInit) {
  return apiFetch<TRes>(path, { ...(init ?? {}), method: "POST", body: JSON.stringify(body) });
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const val = v instanceof Date ? v.toISOString() : String(v);
    if (val !== "") sp.append(k, val);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* ---------- AUTH ---------- */
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { accessToken?: string; token?: string; refreshToken?: string };
export function login(req: LoginRequest) {
  return postJson<LoginRequest, LoginResponse>("/auth/login", req);
}

/* ---------- MAPS / TEMPLATES ---------- */
export interface MapTemplate {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  isPublic: boolean;
  previewImageUrl?: string | null;
  layerCount?: number | null;
  featureCount?: number | null;
}
export interface MapTemplateLayer {
  layerId: string;
  layerName: string;
  featureCount?: number;
}
export interface MapTemplateDetails extends MapTemplate {
  layers: MapTemplateLayer[];
  annotations?: unknown[];
  images?: string[];
}
export interface GetMapTemplatesResponse { templates: MapTemplate[]; }
export async function getMapTemplates(): Promise<MapTemplate[]> {
  const res = await getJson<GetMapTemplatesResponse | MapTemplate[]>("/maps/templates");
  return Array.isArray(res) ? res : (res.templates ?? []);
}
export function getMapTemplateById(templateId: string) {
  return getJson<MapTemplate>(`/maps/templates/${templateId}`);
}
export function getMapTemplateWithDetails(templateId: string) {
  return getJson<MapTemplateDetails>(`/maps/templates/${templateId}/details`);
}
export function getMapTemplateLayerData(templateId: string, layerId: string) {
  return getJson<{ layerData: unknown }>(`/maps/templates/${templateId}/layers/${layerId}/data`);
}
export interface CreateMapTemplateResponse { templateId: string; message?: string; }
export async function createMapTemplateFromGeoJson(args: {
  geoJsonFile: File;
  templateName?: string;
  description?: string;
  layerName?: string;
  category?: string;
  isPublic?: boolean;
}) {
  const form = new FormData();
  form.append("geoJsonFile", args.geoJsonFile);
  if (args.templateName) form.append("templateName", args.templateName);
  if (args.description) form.append("description", args.description);
  if (args.layerName) form.append("layerName", args.layerName);
  if (args.category) form.append("category", args.category);
  form.append("isPublic", String(!!args.isPublic));
  return apiFetch<CreateMapTemplateResponse>("/maps/create-template", {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });
}

/* ---------- SYSTEM ADMIN ---------- */
const ADMIN_BASE = "/admin";
export interface PageParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown; 
}
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/* USERS */
export interface GetUsersFilter extends PageParams {
  search?: string | null;
  status?: string | null;
  [key: string]: unknown; 
}

export function adminGetUsers<TUser = unknown>(p: GetUsersFilter = {}) {
  const query = qs(p);
  return getJson<Paged<TUser>>(`${ADMIN_BASE}/users${query}`);
}
export function adminGetUserById<TUser = unknown>(userId: string) {
  return getJson<TUser>(`${ADMIN_BASE}/users/${userId}`);
}
export function adminUpdateUserStatus<TReq extends object, TRes = unknown>(userId: string, body: TReq) {
  return putJson<TReq, TRes>(`${ADMIN_BASE}/users/${userId}/status`, body);
}
export function adminDeleteUser<TRes = { success?: boolean }>(userId: string) {
  return delJson<TRes>(`${ADMIN_BASE}/users/${userId}`);
}
export function adminImpersonateUser<TRes = { token?: string }>(userId: string) {
  return apiFetch<TRes>(`${ADMIN_BASE}/users/${userId}/impersonate`, { method: "POST" });
}

/* ORGANIZATIONS */
export interface GetOrgsFilter extends PageParams {
  search?: string | null;
  status?: string | null;
  [key: string]: unknown; 
}
export function adminGetOrganizations<TOrg = unknown>(p: GetOrgsFilter = {}) {
  const query = qs(p);
  return getJson<Paged<TOrg>>(`${ADMIN_BASE}/organizations${query}`);
}
export function adminGetOrganizationById<TOrg = unknown>(orgId: string) {
  return getJson<TOrg>(`${ADMIN_BASE}/organizations/${orgId}`);
}
export function adminUpdateOrganizationStatus<TReq extends object, TRes = unknown>(orgId: string, body: TReq) {
  return putJson<TReq, TRes>(`${ADMIN_BASE}/organizations/${orgId}/status`, body);
}
export function adminDeleteOrganization<TRes = { success?: boolean }>(orgId: string) {
  return delJson<TRes>(`${ADMIN_BASE}/organizations/${orgId}`);
}
export interface TransferOwnershipRequestDto { newOwnerId: string; }
export function adminTransferOrganizationOwnership<TRes = unknown>(orgId: string, body: TransferOwnershipRequestDto) {
  return postJson<TransferOwnershipRequestDto, TRes>(`${ADMIN_BASE}/organizations/${orgId}/transfer-ownership`, body);
}

/* SUBSCRIPTION PLANS */
export function adminGetSubscriptionPlans<TPlan = unknown>() {
  return getJson<TPlan[]>(`${ADMIN_BASE}/subscription-plans`);
}
export function adminGetSubscriptionPlanById<TPlan = unknown>(planId: number) {
  return getJson<TPlan>(`${ADMIN_BASE}/subscription-plans/${planId}`);
}
export function adminCreateSubscriptionPlan<TReq extends object, TRes = unknown>(body: TReq) {
  return postJson<TReq, TRes>(`${ADMIN_BASE}/subscription-plans`, body);
}
export function adminUpdateSubscriptionPlan<TReq extends object, TRes = unknown>(planId: number, body: TReq) {
  return putJson<TReq, TRes>(`${ADMIN_BASE}/subscription-plans/${planId}`, body);
}
export function adminDeleteSubscriptionPlan<TRes = { success?: boolean }>(planId: number) {
  return delJson<TRes>(`${ADMIN_BASE}/subscription-plans/${planId}`);
}
export function adminActivateSubscriptionPlan<TRes = { success?: boolean }>(planId: number) {
  return apiFetch<TRes>(`${ADMIN_BASE}/subscription-plans/${planId}/activate`, { method: "POST" });
}
export function adminDeactivateSubscriptionPlan<TRes = { success?: boolean }>(planId: number) {
  return apiFetch<TRes>(`${ADMIN_BASE}/subscription-plans/${planId}/deactivate`, { method: "POST" });
}

/* SUPPORT TICKETS */
export interface GetTicketsFilter extends PageParams {
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  [key: string]: unknown; 
}
export function adminGetSupportTickets<TTicket = unknown>(p: GetTicketsFilter = {}) {
  const query = qs(p);
  return getJson<Paged<TTicket>>(`${ADMIN_BASE}/support-tickets${query}`);
}
export function adminGetSupportTicketById<TTicket = unknown>(ticketId: string) {
  return getJson<TTicket>(`${ADMIN_BASE}/support-tickets/${ticketId}`);
}
export function adminUpdateSupportTicket<TReq extends object, TRes = unknown>(ticketId: string, body: TReq) {
  return putJson<TReq, TRes>(`${ADMIN_BASE}/support-tickets/${ticketId}`, body);
}
export interface CloseTicketRequestDto { resolution: string; }
export function adminCloseSupportTicket<TRes = unknown>(ticketId: string, body: CloseTicketRequestDto) {
  return postJson<CloseTicketRequestDto, TRes>(`${ADMIN_BASE}/support-tickets/${ticketId}/close`, body);
}
export interface AssignTicketRequestDto { assignedToUserId: string; }
export function adminAssignSupportTicket<TRes = unknown>(ticketId: string, body: AssignTicketRequestDto) {
  return postJson<AssignTicketRequestDto, TRes>(`${ADMIN_BASE}/support-tickets/${ticketId}/assign`, body);
}
export interface EscalateTicketRequestDto { reason: string; }
export function adminEscalateSupportTicket<TRes = unknown>(ticketId: string, body: EscalateTicketRequestDto) {
  return postJson<EscalateTicketRequestDto, TRes>(`${ADMIN_BASE}/support-tickets/${ticketId}/escalate`, body);
}

/* USAGE & DASHBOARD */
export function adminGetSystemUsage<TRes = unknown>() {
  return getJson<TRes>(`${ADMIN_BASE}/system-usage`);
}
export function adminGetSystemDashboard<TRes = unknown>() {
  return getJson<TRes>(`${ADMIN_BASE}/dashboard`);
}
export function adminGetActiveAlerts<TAlert = unknown>() {
  return getJson<TAlert[]>(`${ADMIN_BASE}/alerts`);
}
export interface ResolveAlertRequestDto { resolution: string; }
export function adminResolveAlert<TRes = unknown>(alertId: string, body: ResolveAlertRequestDto) {
  return postJson<ResolveAlertRequestDto, TRes>(`${ADMIN_BASE}/alerts/${alertId}/resolve`, body);
}
export function adminGetRecentActivities<TActivity = unknown>(p: PageParams = {}) {
  const query = qs(p);
  return getJson<Paged<TActivity>>(`${ADMIN_BASE}/activities${query}`);
}

/* ANALYTICS */
export function adminGetSystemAnalytics<TRes = unknown>(startDate: Date, endDate: Date) {
  const query = qs({ startDate, endDate });
  return getJson<TRes>(`${ADMIN_BASE}/analytics${query}`);
}
export function adminGetTopUsers<TItem = unknown>(count = 10) {
  const query = qs({ count });
  return getJson<TItem[]>(`${ADMIN_BASE}/top-users${query}`);
}
export function adminGetTopOrganizations<TItem = unknown>(count = 10) {
  const query = qs({ count });
  return getJson<TItem[]>(`${ADMIN_BASE}/top-organizations${query}`);
}
export function adminGetRevenueAnalytics<TRes = unknown>(startDate: Date, endDate: Date) {
  const query = qs({ startDate, endDate });
  return getJson<TRes>(`${ADMIN_BASE}/revenue-analytics${query}`);
}

/* MAINTENANCE */
export interface MaintenanceRequestDto { maintenanceType: string; }
export function adminPerformMaintenance<TRes = unknown>(body: MaintenanceRequestDto) {
  return postJson<MaintenanceRequestDto, TRes>(`${ADMIN_BASE}/maintenance`, body);
}
export function adminClearCache<TRes = { success?: boolean }>() {
  return apiFetch<TRes>(`${ADMIN_BASE}/cache/clear`, { method: "POST" });
}
export function adminBackup<TRes = unknown>() {
  return apiFetch<TRes>(`${ADMIN_BASE}/backup`, { method: "POST" });
}
export interface RestoreRequestDto { backupId: string; }
export function adminRestore<TRes = unknown>(body: RestoreRequestDto) {
  return postJson<RestoreRequestDto, TRes>(`${ADMIN_BASE}/restore`, body);
}

/* CONFIGURATION */
export function adminGetConfiguration<TConf = Record<string, unknown>>() {
  return getJson<TConf>(`${ADMIN_BASE}/configuration`);
}
export function adminUpdateConfiguration<TRes = unknown>(configuration: Record<string, unknown>) {
  return putJson<Record<string, unknown>, TRes>(`${ADMIN_BASE}/configuration`, configuration);
}
export function adminResetConfiguration<TRes = { success?: boolean }>() {
  return apiFetch<TRes>(`${ADMIN_BASE}/configuration/reset`, { method: "POST" });
}
