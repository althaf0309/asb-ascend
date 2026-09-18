export type LocationPage = {
  slug: string;
  name: string;
  region: 'Trivandrum area' | 'Central Kerala' | 'North Kerala' | 'South Kerala';
  delivery: string;
  title: string;
  description: string;
  intro: string;
  keywords: string[];
};

export type LocationTopic = {
  slug: 'generative-ai-course' | 'agentic-ai-course' | 'ai-course' | 'erp-sap-courses' | 'programming-courses' | 'management-courses' | 'internship-programs';
  name: string;
  shortName: string;
  category: 'ai' | 'erp' | 'programming' | 'management' | 'internship';
  summary: string;
  outcomes: string[];
  statewideKeywords: string[];
};

export const locationTopics: LocationTopic[] = [
  {
    slug: 'generative-ai-course', name: 'Generative AI Course', shortName: 'Generative AI', category: 'ai',
    summary: 'Learn prompt engineering, large language models, RAG, AI application development and responsible use through guided practical projects.',
    outcomes: ['Prompt engineering for real tasks', 'LLM and RAG application fundamentals', 'Generative AI workflow projects', 'Portfolio and career preparation'],
    statewideKeywords: ['Generative AI Course in Kerala', 'Gen AI Course in Kerala', 'Best Generative AI Course in Kerala', 'Generative AI Training in Kerala', 'Generative AI Certification Kerala', 'Generative AI Institute in Kerala', 'Best Generative AI Course with Placement in Kerala', 'Gen AI Course with Internship Kerala', 'Online Generative AI Course Kerala'],
  },
  {
    slug: 'agentic-ai-course', name: 'Agentic AI Course', shortName: 'Agentic AI', category: 'ai',
    summary: 'Build AI agents, tool-using workflows and multi-agent systems with practical automation projects and instructor guidance.',
    outcomes: ['AI agent architecture and planning', 'Tool use and workflow automation', 'Multi-agent application projects', 'Deployment and career preparation'],
    statewideKeywords: ['Agentic AI Course in Kerala', 'Best Agentic AI Course in Kerala', 'Agentic AI Training Kerala', 'Agentic AI Certification Kerala', 'Agentic AI Institute Kerala', 'Agentic AI Classes Kerala', 'Agentic AI Training Institute Kerala', 'Agentic AI Course with Placement Kerala', 'Job-Oriented Agentic AI Course in Kerala', 'Advanced Agentic AI Certification Kerala', 'Online Agentic AI Course in Kerala', 'Offline Agentic AI Classes in Kerala', 'Affordable Agentic AI Course Kerala'],
  },
  {
    slug: 'ai-course', name: 'Artificial Intelligence Course', shortName: 'AI', category: 'ai',
    summary: 'Develop practical foundations in artificial intelligence, Python, machine learning, automation and applied AI projects.',
    outcomes: ['Python and AI foundations', 'Machine learning concepts', 'Applied AI and automation projects', 'Certification and career guidance'],
    statewideKeywords: ['AI Course in Kerala', 'Artificial Intelligence Course in Kerala', 'AI Training in Kerala', 'AI Classes in Kerala', 'AI Certification Course in Kerala', 'Best AI Course in Kerala', 'Best AI Institute in Kerala', 'Best AI Training Institute in Kerala', 'AI Institute in Kerala', 'AI Developer Course Kerala', 'Affordable AI Course in Kerala', 'AI Certification for Beginners in Kerala', 'Learn AI Tools in Kerala', 'AI Automation Training Kerala'],
  },
  {
    slug: 'erp-sap-courses', name: 'ERP Courses', shortName: 'ERP', category: 'erp',
    summary: 'Build practical ERP skills across finance, materials, sales, production, HR, quality and technical modules through process-based training.',
    outcomes: ['Business process and ERP foundations', 'Module-focused practical exercises', 'Configuration and implementation concepts', 'ERP career preparation'],
    statewideKeywords: ['ERP Courses in Kerala', 'ERP Training in Kerala', 'ERP Certification Kerala', 'Job-Oriented ERP Courses Kerala'],
  },
  {
    slug: 'programming-courses', name: 'Programming Courses', shortName: 'Programming', category: 'programming',
    summary: 'Learn programming through guided coding practice, application development and portfolio projects across popular languages and full-stack paths.',
    outcomes: ['Programming and problem-solving foundations', 'Frontend and backend development', 'Database and application projects', 'Developer career preparation'],
    statewideKeywords: ['Programming Courses in Kerala', 'Coding Classes Kerala', 'Software Development Course Kerala', 'Full Stack Course Kerala'],
  },
  {
    slug: 'management-courses', name: 'Management Courses', shortName: 'Management', category: 'management',
    summary: 'Develop industry-focused skills in logistics, supply chain, warehouse, HR, finance, hospitality and IT management.',
    outcomes: ['Industry process fundamentals', 'Operational and management tools', 'Case studies and practical assignments', 'Professional career preparation'],
    statewideKeywords: ['Management Courses in Kerala', 'Logistics Course Kerala', 'Supply Chain Training Kerala', 'HR Management Course Kerala'],
  },
  {
    slug: 'internship-programs', name: 'Internship Programs', shortName: 'Internship', category: 'internship',
    summary: 'Combine structured technical training with practical assignments, project experience and internship-oriented career preparation.',
    outcomes: ['Job-oriented technical training', 'Guided practical projects', 'Portfolio and interview preparation', 'Internship and career support'],
    statewideKeywords: ['Internship Programs in Kerala', 'Training with Internship Kerala', 'Job-Oriented Courses with Internship Kerala', 'Career Training Kerala'],
  },
];

const remote = (name: string) =>
  `Students in ${name} can join ASB Training Hub's live online programmes, with instructor-led sessions, practical projects and career support from our Trivandrum training centre.`;

export const locations: LocationPage[] = [
  {
    slug: 'trivandrum', name: 'Trivandrum', region: 'Trivandrum area', delivery: 'Classroom, hybrid and live online',
    title: 'AI Courses in Trivandrum',
    description: 'Join practical Generative AI, Agentic AI, programming, ERP and career courses at ASB Training Hub near Technopark in Trivandrum.',
    intro: 'Learn in the classroom near Technopark or join a live online batch. Our Trivandrum programmes combine trainer guidance, hands-on assignments and career-focused projects.',
    keywords: ['Generative AI Course in Trivandrum', 'AI Course in Trivandrum', 'Agentic AI Course in Trivandrum', 'Best AI Institute in Trivandrum'],
  },
  {
    slug: 'kazhakootam-technopark', name: 'Kazhakootam & Technopark', region: 'Trivandrum area', delivery: 'Classroom near Technopark, hybrid and live online',
    title: 'AI Courses near Technopark, Kazhakootam',
    description: 'Explore AI, Agentic AI, Generative AI, programming and ERP training near Technopark Phase 1 in Kazhakootam, Trivandrum.',
    intro: 'ASB Training Hub is located at The Atomic near Technopark Phase 1, making this the local page for learners and working professionals around Kazhakootam and the Technopark campus.',
    keywords: ['AI Course in Kazhakootam', 'AI Training near Technopark', 'Generative AI Course near Technopark', 'Agentic AI Training Kazhakootam'],
  },
  {
    slug: 'kochi-ernakulam', name: 'Kochi & Ernakulam', region: 'Central Kerala', delivery: 'Live online',
    title: 'AI Courses in Kochi and Ernakulam', description: 'Live online Generative AI and Agentic AI training for learners in Kochi and Ernakulam, with practical projects and career support.',
    intro: remote('Kochi and Ernakulam'),
    keywords: ['Generative AI Course in Kochi', 'AI Course in Kochi', 'AI Classes in Kochi', 'AI Training Institute in Kochi', 'Agentic AI Course in Kochi', 'AI Course in Ernakulam', 'Agentic AI Course in Ernakulam'],
  },
  {
    slug: 'kozhikode-calicut', name: 'Kozhikode & Calicut', region: 'North Kerala', delivery: 'Live online',
    title: 'AI Courses in Kozhikode and Calicut', description: 'Join live online Generative AI, Agentic AI and job-oriented AI courses from Kozhikode and Calicut.',
    intro: remote('Kozhikode and Calicut'),
    keywords: ['Generative AI Course in Kozhikode', 'AI Course in Calicut', 'Agentic AI Course in Kozhikode'],
  },
  {
    slug: 'thrissur', name: 'Thrissur', region: 'Central Kerala', delivery: 'Live online',
    title: 'AI Courses in Thrissur', description: 'Practical live online Generative AI and Agentic AI courses for students and professionals in Thrissur.', intro: remote('Thrissur'),
    keywords: ['AI Course in Thrissur', 'Agentic AI Course in Thrissur', 'Generative AI Training Thrissur'],
  },
  {
    slug: 'kollam', name: 'Kollam', region: 'South Kerala', delivery: 'Live online',
    title: 'AI Courses in Kollam', description: 'Learn Generative AI, Agentic AI and AI automation through live online courses for learners in Kollam.', intro: remote('Kollam'),
    keywords: ['AI Course in Kollam', 'Agentic AI Course in Kollam', 'Generative AI Training Kollam'],
  },
  {
    slug: 'kottayam', name: 'Kottayam', region: 'Central Kerala', delivery: 'Live online',
    title: 'AI Courses in Kottayam', description: 'Instructor-led online AI, Generative AI and Agentic AI training for students and working professionals in Kottayam.', intro: remote('Kottayam'),
    keywords: ['AI Course in Kottayam', 'Agentic AI Course in Kottayam', 'Generative AI Training Kottayam'],
  },
  {
    slug: 'kannur', name: 'Kannur', region: 'North Kerala', delivery: 'Live online',
    title: 'AI Courses in Kannur', description: 'Join practical live online Generative AI, Agentic AI and AI automation training from Kannur.', intro: remote('Kannur'),
    keywords: ['AI Course in Kannur', 'Agentic AI Course in Kannur', 'Generative AI Training Kannur'],
  },
  {
    slug: 'alappuzha', name: 'Alappuzha', region: 'Central Kerala', delivery: 'Live online',
    title: 'Agentic AI Courses in Alappuzha', description: 'Live online Agentic AI and Generative AI programmes with practical projects for learners in Alappuzha.', intro: remote('Alappuzha'),
    keywords: ['Agentic AI Course in Alappuzha', 'AI Course in Alappuzha', 'Generative AI Training Alappuzha'],
  },
  {
    slug: 'palakkad', name: 'Palakkad', region: 'Central Kerala', delivery: 'Live online',
    title: 'Agentic AI Courses in Palakkad', description: 'Study Agentic AI, Generative AI and AI automation through instructor-led online training from Palakkad.', intro: remote('Palakkad'),
    keywords: ['Agentic AI Course in Palakkad', 'AI Course in Palakkad', 'Generative AI Training Palakkad'],
  },
  {
    slug: 'malappuram', name: 'Malappuram', region: 'North Kerala', delivery: 'Live online',
    title: 'Agentic AI Courses in Malappuram', description: 'Career-focused online Agentic AI and Generative AI courses for students and professionals in Malappuram.', intro: remote('Malappuram'),
    keywords: ['Agentic AI Course in Malappuram', 'AI Course in Malappuram', 'Generative AI Training Malappuram'],
  },
];

export const locationBySlug = (slug?: string) => locations.find((item) => item.slug === slug);
export const locationTopicBySlug = (slug?: string) => locationTopics.find((item) => item.slug === slug);
export const districtPath = (location: LocationPage) => `/locations/kerala/${location.slug}`;
export const topicPath = (location: LocationPage, topic: LocationTopic) => `${districtPath(location)}/${topic.slug}`;
export const localizedCoursePath = (location: LocationPage, courseSlug: string) => `${districtPath(location)}/course/${courseSlug}`;
export const topicForCategory = (category: string) => locationTopics.find((topic) => topic.category === category);

export const topicKeywordsForLocation = (location: LocationPage, topic: LocationTopic) => {
  const local = location.keywords.filter((keyword) => {
    const value = keyword.toLowerCase();
    if (topic.slug === 'generative-ai-course') return value.includes('generative') || value.includes('gen ai');
    if (topic.slug === 'agentic-ai-course') return value.includes('agentic');
    if (topic.slug === 'ai-course') return value.includes('ai course') || value.includes('ai training') || value.includes('ai classes') || value.includes('ai institute');
    return value.includes(topic.shortName.toLowerCase());
  });
  const generated = [
    `${topic.name} in ${location.name}`,
    `Best ${topic.name} in ${location.name}`,
    `${topic.shortName} Training in ${location.name}`,
    `${topic.shortName} Certification in ${location.name}`,
    `Online ${topic.name} in ${location.name}`,
    `${topic.name} with Placement Support in ${location.name}`,
  ];
  return [...new Set([...local, ...generated])];
};
