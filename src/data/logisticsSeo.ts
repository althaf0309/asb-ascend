export type LogisticsFamily = 'logistics' | 'warehouse';

export type LogisticsSeoPage = {
  family: LogisticsFamily;
  slug: string;
  title: string;
  label: string;
  intent: string;
  location: string;
  question: boolean;
};

export const logisticsFamilies = {
  logistics: {
    label: 'Logistics and Supply Chain Management',
    segment: 'Diploma-in-Logistics-and-Supply-Chain-Management',
    legacySegment: 'logistics',
    primarySlug: 'diploma-in-logistics-and-supply-chain-management',
    defaultImage: '/images/logistics-supply-chain-course-hero.webp',
    intro: 'Learn how purchasing, inventory, transport, warehousing and customer service connect across a modern supply chain.',
  },
  warehouse: {
    label: 'Warehouse and Inventory Management',
    segment: 'Diploma-in-warehouse-Management',
    legacySegment: 'warehouse',
    primarySlug: 'diploma-in-warehouse-management',
    defaultImage: '/images/warehouse-inventory-course-hero.webp',
    intro: 'Build practical knowledge of receiving, storage, stock accuracy, fulfilment, safety and warehouse operations.',
  },
} as const;

export const logisticsFamilyFromSegment = (segment?: string): LogisticsFamily | undefined => {
  if (!segment) return undefined;
  const normalized = segment.toLowerCase();
  return (Object.entries(logisticsFamilies) as Array<[LogisticsFamily, typeof logisticsFamilies[LogisticsFamily]]>)
    .find(([family, details]) => normalized === family || normalized === details.segment.toLowerCase())?.[0];
};

export const logisticsFamilyPath = (family: LogisticsFamily) =>
  `/course-training/${logisticsFamilies[family].segment}`;

export const logisticsPagePath = (page: LogisticsSeoPage) => {
  const base = logisticsFamilyPath(page.family);
  return page.slug === logisticsFamilies[page.family].primarySlug ? base : `${base}/${page.slug}`;
};

const careerIntents = new Set(['career', 'placement', 'internship', 'after-school', 'graduate']);
const guidanceIntents = new Set(['fees', 'admission', 'question', 'duration', 'online', 'near-me']);

export const logisticsPageImage = (page: LogisticsSeoPage) => {
  if (page.family === 'logistics') {
    if (careerIntents.has(page.intent)) return '/images/logistics-career-placement-hero.webp';
    if (guidanceIntents.has(page.intent)) return '/images/logistics-admission-fees-hero.webp';
  } else {
    if (careerIntents.has(page.intent)) return '/images/warehouse-career-placement-hero.webp';
    if (guidanceIntents.has(page.intent) || page.intent === 'certification') return '/images/warehouse-inventory-analytics-hero.webp';
  }
  return logisticsFamilies[page.family].defaultImage;
};
