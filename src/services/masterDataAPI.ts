import api from "./api";

// Generic CRUD helper
const createCRUD = (endpoint: string) => ({
    getAll: async () => (await api.get(endpoint)).data,
    getOne: async (id: number) => (await api.get(`${endpoint}/${id}`)).data,
    create: async (data: any) => (await api.post(endpoint, data)).data,
    update: async (id: number, data: any) => (await api.patch(`${endpoint}/${id}`, data)).data,
    delete: async (id: number) => (await api.delete(`${endpoint}/${id}`)).data,
});

export const categoriesAPI = createCRUD('/categories');
export const partsAPI = createCRUD('/parts');
export const stagesAPI = createCRUD('/stages');
export const defectsAPI = createCRUD('/defects');

// Legacy methods
export const getCategories = categoriesAPI.getAll;
export const getParts = partsAPI.getAll;
export const getStages = stagesAPI.getAll;
export const getDefects = defectsAPI.getAll;

export const createEntryBatch = async (data: any) => {
    const res = await api.post('/entries/batch', data);
    return res.data;
};

export const getDashboardStats = async () => {
    const res = await api.get('/reports/dashboard-stats');
    return res.data;
};

export const getAuditLogs = async (startDate: string, endDate: string) => {
    const res = await api.get('/audit-logs', {
        params: { startDate, endDate }
    });
    return res.data;
};

export const getCustomReport = async (startDate: string, endDate: string, type: string) => {
    const res = await api.get('/reports', {
        params: { startDate, endDate, type }
    });
    return res.data;
};