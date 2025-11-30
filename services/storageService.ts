
import { EmployeeData, Organization } from '../types';

const DB_KEY = 'kai_platform_db_v1';

interface Database {
  organizations: Organization[];
  employees: EmployeeData[];
}

// Initial Mock Data to populate the dashboard for demo purposes
const INITIAL_DATA: Database = {
  organizations: [
    { id: 'org_1', name: 'Demo Corp', code: 'DEMO2025', createdAt: new Date().toISOString() }
  ],
  employees: [
    { id: '1', orgCode: 'DEMO2025', name: 'Jan Jansen', email: 'jan@demo.com', department: 'Finance', kaiScore: -6, readinessScore: 85, exposureScore: 80, archetype: 'De System Guardian', completedAt: new Date().toISOString() },
    { id: '2', orgCode: 'DEMO2025', name: 'Sophie de Vries', email: 'sophie@demo.com', department: 'Marketing', kaiScore: 8, readinessScore: 92, exposureScore: 60, archetype: 'De Visionary Architect', completedAt: new Date().toISOString() },
    { id: '3', orgCode: 'DEMO2025', name: 'Pieter Bakker', email: 'pieter@demo.com', department: 'Operations', kaiScore: -7, readinessScore: 30, exposureScore: 40, archetype: 'De Practical Traditionalist', completedAt: new Date().toISOString() },
    { id: '4', orgCode: 'DEMO2025', name: 'Emma Visser', email: 'emma@demo.com', department: 'Sales', kaiScore: 5, readinessScore: 45, exposureScore: 50, archetype: 'De Creative Experimenter', completedAt: new Date().toISOString() },
    { id: '5', orgCode: 'DEMO2025', name: 'Ahmet Yilmaz', email: 'ahmet@demo.com', department: 'IT', kaiScore: 2, readinessScore: 70, exposureScore: 55, archetype: 'De Strategic Integrator', completedAt: new Date().toISOString() },
    { id: '6', orgCode: 'DEMO2025', name: 'Lisa de Jong', email: 'lisa@demo.com', department: 'HR', kaiScore: 0, readinessScore: 65, exposureScore: 30, archetype: 'De Pragmatic Bridge', completedAt: new Date().toISOString() },
    { id: '7', orgCode: 'DEMO2025', name: 'Karel Visser', email: 'karel@demo.com', department: 'Legal', kaiScore: -5, readinessScore: 20, exposureScore: 20, archetype: 'De Resistant Skeptic', completedAt: new Date().toISOString() },
  ]
};

// Helper to get/set DB
const getDB = (): Database => {
  if (typeof window === 'undefined') return INITIAL_DATA;
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

const saveDB = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const storageService = {
  // Organizations
  getOrganizations: (): Organization[] => {
    return getDB().organizations;
  },

  createOrganization: (name: string, code: string): boolean => {
    const db = getDB();
    if (db.organizations.some(o => o.code === code)) return false; // Code taken
    
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name,
      code,
      createdAt: new Date().toISOString()
    };
    
    db.organizations.push(newOrg);
    saveDB(db);
    return true;
  },

  deleteOrganization: (id: string) => {
    const db = getDB();
    db.organizations = db.organizations.filter(o => o.id !== id);
    // Optional: cleanup employees
    saveDB(db);
  },

  getOrgByCode: (code: string): Organization | undefined => {
    return getDB().organizations.find(o => o.code === code);
  },

  // Employees
  getEmployees: (orgCode: string): EmployeeData[] => {
    return getDB().employees.filter(e => e.orgCode === orgCode);
  },

  addEmployee: (employee: Omit<EmployeeData, 'id' | 'completedAt'>) => {
    const db = getDB();
    const newEmployee: EmployeeData = {
      ...employee,
      id: `emp_${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    db.employees.push(newEmployee);
    saveDB(db);
    return newEmployee;
  },

  deleteEmployee: (id: string) => {
    const db = getDB();
    db.employees = db.employees.filter(e => e.id !== id);
    saveDB(db);
  }
};
