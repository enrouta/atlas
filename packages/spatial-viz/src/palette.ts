import { eRiskLevel } from '@enrouta/types';

/**
 * One flat color per discrete risk level — the default rendering palette. The
 * levels themselves are producer-owned; this is only how they're drawn. Muted by
 * design so the map's streets stay visible under a semi-transparent fill.
 */
export const RISK_PALETTE: Record<eRiskLevel, string> = {
  [eRiskLevel.LOW]: '#45C46D',
  [eRiskLevel.MEDIUM]: '#D6D24B',
  [eRiskLevel.HIGH]: '#F59E0B',
  [eRiskLevel.CRITICAL]: '#EF4444',
};
