/**
 * @enrouta/types — shared domain contracts for the EnRouta spatial-safety
 * platform: enums, DTOs and response shapes used by the API and client apps.
 */

export enum eAlertOrigin {
  RIDER = 'RIDER',
  /** Seeded via an import. No reporter; provenance in `source`. */
  IMPORTED = 'IMPORTED',
}

/** Account role. `admin` gates the import path. */
export enum eUserRole {
  RIDER = 'rider',
  ADMIN = 'admin',
}

export enum eAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum eAlertType {
  ROBBERY = 'robbery',
  ASSAULT = 'assault',
  ACCIDENT = 'accident',
  ROAD_BLOCK = 'road_block',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

/** GeoJSON Point — coordinates are [longitude, latitude]. */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

/** A place a rider can reach for support — emergency or everyday. */
export enum eAssistancePointType {
  POLICE = 'police',
  HOSPITAL = 'hospital',
  FIRE_STATION = 'fire_station',
}

/** Trust/category tier. Only `official` is populated in the MVP. */
export enum eAssistancePointTier {
  OFFICIAL = 'official',
  PARTNER = 'partner',
}

/** What support a point offers the rider. */
export enum eAssistanceAmenity {
  CHARGING = 'charging',
  BATHROOM = 'bathroom',
  WATER = 'water',
  SEATING = 'seating',
  SHELTER = 'shelter',
  WIFI = 'wifi',
  PARKING = 'parking',
  FIRST_AID = 'first_aid',
  SECURITY = 'security',
}

/** EnRouta-owned verification stamp. */
export enum eVerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/** An opening window in local time, "HH:MM" 24-hour clock. A 24h day is 00:00–24:00. */
export interface TimeWindow {
  open: string;
  close: string;
}

/**
 * Weekly opening schedule. Each day holds zero or more windows (empty = closed;
 * multiple = split hours, e.g. siesta). Times are the region's local time. A
 * window whose close is <= open spills past midnight. "Open now" is derived on
 * the client from this.
 */
export interface WeeklyHours {
  mon: TimeWindow[];
  tue: TimeWindow[];
  wed: TimeWindow[];
  thu: TimeWindow[];
  fri: TimeWindow[];
  sat: TimeWindow[];
  sun: TimeWindow[];
}

/** An assistance point as returned by GET /api/v1/assistance-points. Read-only for clients. */
export interface AssistancePoint {
  id: string;
  name: string;
  type: eAssistancePointType;
  tier: eAssistancePointTier;
  amenities: eAssistanceAmenity[];
  /** Weekly opening schedule; null when unknown (such points are not shown). */
  hours: WeeklyHours | null;
  location: GeoPoint;
  createdAt: string;
}

/**
 * An assistance point with the admin-only fields, as an admin sees it
 * (GET /assistance-points/all). The public shape hides `active`/`verificationStatus`.
 */
export interface AdminAssistancePoint extends AssistancePoint {
  active: boolean;
  verificationStatus: eVerificationStatus;
}

/** Body for POST /api/v1/assistance-points (admin). Defaults suit official points. */
export interface CreateAssistancePointRequest {
  name: string;
  type: eAssistancePointType;
  location: GeoPoint;
  hours?: WeeklyHours;
  amenities?: eAssistanceAmenity[];
  tier?: eAssistancePointTier;
  verificationStatus?: eVerificationStatus;
  active?: boolean;
}

/** Body for PATCH /api/v1/assistance-points/:id (admin) — every field optional. */
export type UpdateAssistancePointRequest = Partial<CreateAssistancePointRequest>;

/**
 * One hand-filled row in a bulk import. Flat `lat`/`lng` (human order,
 * as copied from Google Maps) — the backend assembles the GeoJSON. Rows are
 * validated one by one, so a bad row is skipped and reported, not fatal.
 */
export interface ImportAssistancePointItem {
  name: string;
  type: eAssistancePointType;
  lat: number;
  lng: number;
  amenities?: eAssistanceAmenity[];
}

/** Request body for POST /api/v1/assistance-points/import (admin only). */
export interface ImportAssistancePointsRequest {
  points: ImportAssistancePointItem[];
}

/**
 * Why a row was skipped during import — a machine code the client localizes.
 * `invalid_*` mean the field was missing/malformed; `out_of_coverage` means the
 * coordinate sits outside every supported region.
 */
export type ImportAssistancePointSkipCode =
  | 'invalid_name'
  | 'invalid_type'
  | 'invalid_lat'
  | 'invalid_lng'
  | 'invalid_amenities'
  | 'out_of_coverage';

/** A row the import could not create. `row` is 1-based (as the partner sees it). */
export interface ImportAssistancePointSkip {
  row: number;
  /** Best-effort name for display; empty when the row had none. */
  name: string;
  code: ImportAssistancePointSkipCode;
}

/** Response of POST /api/v1/assistance-points/import — partial import + report. */
export interface ImportAssistancePointsResponse {
  imported: number;
  skipped: ImportAssistancePointSkip[];
}

/** Request body for POST /api/v1/alerts. */
export interface CreateAlertDto {
  location: GeoPoint;
  type: eAlertType;
  origin: eAlertOrigin;
  severity?: eAlertSeverity;
  /**
   * When the rider reported the incident (ISO-8601) — which may be minutes
   * after the event, once they were safe. Lets a deferred report (queued while
   * offline, flushed later) decay from when it was reported, not when the
   * backend received it. Optional; the server defaults it to receive-time and
   * caps it at now (a future time is rejected; decay handles old ones).
   */
  reportedAt?: string;
}

/** One seeded incident in an import. */
export interface ImportAlertItem {
  location: GeoPoint;
  type: eAlertType;
  severity?: eAlertSeverity;
  /** Provenance label; defaults to 'manual' server-side when omitted. */
  source?: string;
}

/** Request body for POST /api/v1/alerts/import (admin only). */
export interface ImportAlertsRequest {
  alerts: ImportAlertItem[];
}

/** Response of POST /api/v1/alerts/import. */
export interface ImportAlertsResponse {
  imported: number;
}

/** Alert as returned by the API. */
export interface Alert {
  id: string;
  location: GeoPoint;
  h3Index: string;
  type: eAlertType;
  severity: eAlertSeverity;
  riskProfileId: number;
  origin: eAlertOrigin;
  /** Human-readable address, reverse-geocoded by the backend. Null if unknown. */
  address: string | null;
  /** When the rider reported the incident — the basis for time-decay. */
  reportedAt: string;
  createdAt: string;
}

/** Item returned by GET /api/v1/risk/cells. */
export interface CellContext {
  cellId: string;
  risk: number;
}

/** Discrete risk level of a zone (drives the map fill color). */
export enum eRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/** Properties carried by each risk zone feature. */
export interface RiskZoneProperties {
  level: eRiskLevel;
  /** Mean risk of the zone's member cells. */
  risk: number;
}

/**
 * One zone of the risk partition, as a GeoJSON Feature. Geometry is a Polygon
 * or MultiPolygon whose rings are [lng, lat] pairs — the union of complete H3
 * cells (the H3 grid itself is never exposed).
 */
export interface RiskZoneFeature {
  type: 'Feature';
  properties: RiskZoneProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

/** Response of GET /api/v1/risk/zones — a GeoJSON FeatureCollection. */
export interface RiskZoneCollection {
  type: 'FeatureCollection';
  features: RiskZoneFeature[];
}

/**
 * Response of GET /api/v1/risk/zone?lat=&lng= — the risk at a single point
 * (the "Índice de riesgo" card). All values are backend-computed; the client
 * only displays them.
 */
export interface RiskScore {
  level: eRiskLevel;
  /** Raw risk at the point. */
  risk: number;
  /** Risk presented on a 0..max scale. */
  score: number;
  max: number;
}

/** Returned by GET /api/v1/awareness/nearby (or null when no context). */
export interface NearbyContext {
  alertType: eAlertType;
}

/** Bounding box tuple: [minLat, minLng, maxLat, maxLng]. */
export type BoundingBox = [number, number, number, number];

/**
 * A coverage region — an area where EnRouta is live. Returned by
 * GET /api/v1/regions. Bounds map centering, viewing and reporting.
 */
export interface Region {
  id: string;
  label: string;
  /** Map camera center, [lng, lat]. */
  center: [number, number];
  /** Coverage bounds, [minLat, minLng, maxLat, maxLng]. */
  bbox: BoundingBox;
  defaultZoom: number;
}

/** Request body for PATCH /api/v1/auth/region — sets the rider's region. */
export interface SetRegionRequest {
  regionId: string;
}

/** Authenticated user as exposed by the API. */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  /** How many alerts this rider has reported — their contribution stat. */
  alertsEmitted: number;
  /** The rider's current region, or null until they pick one. */
  regionId: string | null;
  /** Account role — `admin` unlocks the import path. */
  role: eUserRole;
}

/** JWT pair issued by the backend. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Response of POST /auth/login and /auth/verify. */
export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

/** Request body for POST /auth/register. */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Response of POST /auth/register: the account exists but must verify its email
 * (via a 6-digit code) before tokens are issued.
 */
export interface RegisterResponse {
  requiresVerification: true;
  email: string;
}

/** Request body for POST /auth/verify. */
export interface VerifyRequest {
  email: string;
  code: string;
}

/** Request body for POST /auth/resend-verification. */
export interface ResendVerificationRequest {
  email: string;
}

/** Request body for POST /auth/forgot-password — starts the reset (sends an OTP). */
export interface ForgotPasswordRequest {
  email: string;
}

/** Request body for POST /auth/verify-reset-code — step 1: OTP → reset token. */
export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

/** Response of POST /auth/verify-reset-code — the token that authorizes step 2. */
export interface ResetTokenResponse {
  resetToken: string;
}

/** Request body for POST /auth/reset-password — step 2: set the new password. */
export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
}

/** Request body for POST /auth/login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Request body for POST /auth/refresh. */
export interface RefreshRequest {
  refreshToken: string;
}
