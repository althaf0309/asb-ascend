type PythonPageLike = { slug: string; title: string; intent: string; location: string; question?: boolean };

export const PYTHON_SEGMENT: string;
export const PYTHON_PRIMARY_SLUG: string;
export const PYTHON_LABEL: string;
export const PYTHON_HERO: string;
export function pythonPagePath(page: PythonPageLike): string;
export function pythonPageHeroImage(page: PythonPageLike): string;
export function isNearCampus(place: string): boolean;
export function pythonTopic(title: string): string;
export function pythonSkills(page: PythonPageLike): string[];
export function pythonDescription(page: PythonPageLike): string;
export function pythonPageSections(page: PythonPageLike): Array<{ heading: string; text: string }>;
