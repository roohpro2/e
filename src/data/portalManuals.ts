import { portal1Manual } from './manuals/portal1Manual';
import { portal2Manual } from './manuals/portal2Manual';
import { portal3Manual } from './manuals/portal3Manual';
import { portal4Manual } from './manuals/portal4Manual';
import { portal5Manual } from './manuals/portal5Manual';
import { portal6Manual } from './manuals/portal6Manual';

export interface ManualSection {
  id: string;
  title: string;
  iconName?: string;
  summary: string;
  content: string[];
}

export interface PortalManual {
  windowId: number;
  portalTitle: string;
  portalSubtitle: string;
  totalLinesEstimate: number;
  badge: string;
  overview: string;
  sections: ManualSection[];
}

export const PORTAL_MANUALS: Record<number, PortalManual> = {
  1: portal1Manual,
  2: portal2Manual,
  3: portal3Manual,
  4: portal4Manual,
  5: portal5Manual,
  6: portal6Manual,
};

export {
  portal1Manual,
  portal2Manual,
  portal3Manual,
  portal4Manual,
  portal5Manual,
  portal6Manual
};
