export const initialDashboardData = {
  taskProgress: {
    completed: 435,
    total: 500,
    percentage: 64,
    month: 'This Month',
  },
  totalExpenses: {
    amount: 8414,
    formatted: '$8,414',
    growth: 12,
    sparkline: [
      { name: 'Point 1', value: 4000 },
      { name: 'Point 2', value: 7500 },
      { name: 'Point 3', value: 3000 },
      { name: 'Point 4', value: 6200 },
      { name: 'Point 5', value: 5100 },
      { name: 'Point 6', value: 8414 },
    ]
  },
  averageFinishedTask: {
    avgCount: 52,
    month: 'This Month',
    heatmapData: [
      [0, 1, 0, 4, 4, 1, 4],
      [1, 1, 4, 4, 1, 1, 0],
      [0, 1, 4, 1, 0, 4, 4],
      [0, 1, 0, 4, 1, 2, 0],
      [0, 3, 0, 0, 0, 3, 0],
    ]
  },
  taskSummaries: {
    total: 126,
    change: -4,
    periodLabel: 'Sun, 1 Dec - Sat, 7 Dec',
    dailyBreakdown: [
      { day: 'Sun, 1 Dec', Marketing: 3, Design: 15, Production: 32 },
      { day: 'Mon, 2 Dec', Marketing: 10, Design: 18, Production: 22 },
      { day: 'Tue, 3 Dec', Marketing: 5, Design: 16, Production: 29 },
      { day: 'Wed, 4 Dec', Marketing: 6, Design: 18, Production: 26 },
      { day: 'Thu, 5 Dec', Marketing: 16, Design: 12, Production: 24 },
      { day: 'Fri, 6 Dec', Marketing: 8, Design: 24, Production: 18 },
      { day: 'Sat, 7 Dec', Marketing: 13, Design: 22, Production: 15 },
    ]
  },
  highlightedCompany: {
    name: 'Product design',
    category: 'Web Design',
    totalTransactions: 1641,
    formattedTransactions: '1,641',
    sparkline: [3, 8, 4, 9, 2, 7, 3, 10, 5, 8, 2, 5]
  },
  totalRevenue: {
    amountFormatted: '$56,123k',
    growth: 12,
    yearlyData: [
      { year: '2019', revenue: 15000 },
      { year: '2020', revenue: 28000 },
      { year: '2021', revenue: 22000 },
      { year: '2022', revenue: 45000 },
      { year: '2023', revenue: 56123 },
    ]
  },
  expensesAllocation: {
    amountFormatted: '$44,171k',
    growth: 12,
    categories: [
      { name: 'Production', value: 10000 },
      { name: 'Marketing', value: 18000 },
      { name: 'Operational', value: 25000 },
      { name: 'Design', value: 32000 },
    ]
  },
  completedTasksCount: 44,
  teams: [
    { id: 'a1111111-1111-1111-1111-111111111111', name: "Marketing Team's", badge: 'M' },
    { id: 'a2222222-2222-2222-2222-222222222222', name: "Design Team's", badge: 'D' },
    { id: 'a3333333-3333-3333-3333-333333333333', name: "Production Team's", badge: 'P' },
    { id: 'a4444444-4444-4444-4444-444444444444', name: "Development Team's", badge: 'DEV' },
    { id: 'a5555555-5555-5555-5555-555555555555', name: "Operations Team's", badge: 'OPS' },
  ]
};

export const initialCompanyList = [
  { id: '1', name: 'Product design', category: 'Web Design', transactions: '1,641', revenue: '$15,000', expenses: '$2,100', status: 'Featured', is_featured: true, logo_bg: 'bg-[#d94e34]' },
  { id: '2', name: 'Acme Corp', category: 'Enterprise Software', transactions: '892', revenue: '$24,000', expenses: '$3,400', status: 'Active', is_featured: false, logo_bg: 'bg-black' },
  { id: '3', name: 'Starlight Studio', category: 'Branding & UI', transactions: '1,240', revenue: '$18,000', expenses: '$2,800', status: 'Active', is_featured: false, logo_bg: 'bg-gray-800' },
  { id: '4', name: 'TechLabs Inc', category: 'Cloud Infrastructure', transactions: '540', revenue: '$31,000', expenses: '$4,200', status: 'Active', is_featured: false, logo_bg: 'bg-gray-700' },
];

export const initialTaskList = [
  // Sun, 1 Dec
  { id: 't1', title: 'Q4 Brand Strategy & Market Analysis', team: "Marketing Team's", status: 'Completed', date: '2026-12-01', company: 'Product design' },
  { id: 't2', title: 'UI Component Library Standardization', team: "Design Team's", status: 'Completed', date: '2026-12-01', company: 'Product design' },
  { id: 't3', title: 'Kubernetes Cluster Deployment', team: "Production Team's", status: 'Completed', date: '2026-12-01', company: 'TechLabs Inc' },

  // Mon, 2 Dec
  { id: 't4', title: 'Social Media Campaign & Ad Creative', team: "Marketing Team's", status: 'Completed', date: '2026-12-02', company: 'Acme Corp' },
  { id: 't5', title: 'Mobile App Wireframe & Prototyping', team: "Design Team's", status: 'Completed', date: '2026-12-02', company: 'Starlight Studio' },
  { id: 't6', title: 'PostgreSQL Index Optimization & Cleanup', team: "Production Team's", status: 'Completed', date: '2026-12-02', company: 'Product design' },

  // Tue, 3 Dec
  { id: 't7', title: 'SEO Keyword Strategy & Landing Page Copy', team: "Marketing Team's", status: 'In Progress', date: '2026-12-03', company: 'Product design' },
  { id: 't8', title: 'Figma Design System Token Migration', team: "Design Team's", status: 'Completed', date: '2026-12-03', company: 'Product design' },
  { id: 't9', title: 'Docker Container Security Audit', team: "Production Team's", status: 'Completed', date: '2026-12-03', company: 'TechLabs Inc' },

  // Wed, 4 Dec
  { id: 't10', title: 'Email Newsletter Automation Setup', team: "Marketing Team's", status: 'In Progress', date: '2026-12-04', company: 'Acme Corp' },
  { id: 't11', title: 'Dashboard Dark Mode Palette Design', team: "Design Team's", status: 'Completed', date: '2026-12-04', company: 'Product design' },
  { id: 't12', title: 'Redis Cache Layer Configuration', team: "Production Team's", status: 'In Progress', date: '2026-12-04', company: 'TechLabs Inc' },

  // Thu, 5 Dec
  { id: 't13', title: 'Lead Generation Funnel Analytics', team: "Marketing Team's", status: 'Todo', date: '2026-12-05', company: 'Acme Corp' },
  { id: 't14', title: 'User Onboarding Flow Redesign', team: "Design Team's", status: 'In Progress', date: '2026-12-05', company: 'Starlight Studio' },
  { id: 't15', title: 'CI/CD Pipeline Automation', team: "Production Team's", status: 'Completed', date: '2026-12-05', company: 'TechLabs Inc' },

  // Fri, 6 Dec
  { id: 't16', title: 'Customer Feedback Survey Launch', team: "Marketing Team's", status: 'In Progress', date: '2026-12-06', company: 'Acme Corp' },
  { id: 't17', title: 'Responsive Mobile Layout Audit', team: "Design Team's", status: 'Completed', date: '2026-12-06', company: 'Product design' },
  { id: 't18', title: 'SSL Certificate Renewal & Domain DNS', team: "Production Team's", status: 'Completed', date: '2026-12-06', company: 'TechLabs Inc' },

  // Sat, 7 Dec
  { id: 't19', title: 'Product Launch Webinar Preparation', team: "Marketing Team's", status: 'Todo', date: '2026-12-07', company: 'Product design' },
  { id: 't20', title: 'Iconography & Asset Export Package', team: "Design Team's", status: 'In Progress', date: '2026-12-07', company: 'Starlight Studio' },
  { id: 't21', title: 'Supabase Row Level Security Audit', team: "Production Team's", status: 'Todo', date: '2026-12-07', company: 'Product design' },
];

export const initialNotesList = [
  { id: '1', title: 'Design Sprint Feedback', content: 'Clean dark accents and high contrast text preferred for dashboard components.', date: '2026-12-05' },
  { id: '2', title: 'Q3 Budget Allocation', content: 'Increase design team budget by 15% for new brand assets.', date: '2026-12-06' }
];

export const initialContactsList = [
  { id: '1', name: 'John Doe', email: 'john.d@company.com', role: 'Lead Designer', company: 'Product design' },
  { id: '2', name: 'Sarah Connor', email: 'sarah@acme.org', role: 'Product Manager', company: 'Acme Corp' },
  { id: '3', name: 'Alex Rivera', email: 'alex@devs.io', role: 'Fullstack Developer', company: 'TechLabs Inc' },
];
