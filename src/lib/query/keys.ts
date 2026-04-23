export const queryKeys = {
  persons: {
    all: ['persons'] as const,
    lists: () => [...queryKeys.persons.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.persons.lists(), filters] as const,
    details: () => [...queryKeys.persons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.persons.details(), id] as const,
    history: (id: string) => [...queryKeys.persons.detail(id), 'history'] as const,
    teamExperiences: (id: string) => [...queryKeys.persons.detail(id), 'team-experiences'] as const,
  },

  encounters: {
    all: ['encounters'] as const,
    lists: () => [...queryKeys.encounters.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.encounters.lists(), filters] as const,
    details: () => [...queryKeys.encounters.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.encounters.details(), id] as const,
    summary: (id: string) => [...queryKeys.encounters.detail(id), 'summary'] as const,
    teams: (id: string) => [...queryKeys.encounters.detail(id), 'teams'] as const,
    availablePeople: (id: string) => [...queryKeys.encounters.detail(id), 'available-people'] as const,
    previousParticipants: (id: string) => [...queryKeys.encounters.detail(id), 'previous-participants'] as const,
    participants: (id: string) => [...queryKeys.encounters.detail(id), 'participants'] as const,
    analysis: (id: string) => [...queryKeys.encounters.detail(id), 'analysis'] as const,
  },

  movements: {
    all: ['movements'] as const,
    lists: () => [...queryKeys.movements.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.movements.lists(), filters] as const,
    details: () => [...queryKeys.movements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.movements.details(), id] as const,
    teams: (id: string) => [...queryKeys.movements.detail(id), 'teams'] as const,
  },

  parishes: {
    all: ['parishes'] as const,
    lists: () => [...queryKeys.parishes.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.parishes.lists(), filters] as const,
    details: () => [...queryKeys.parishes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.parishes.details(), id] as const,
    skills: (id: string) => [...queryKeys.parishes.detail(id), 'skills'] as const,
  },

  dioceses: {
    all: ['dioceses'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.dioceses.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.dioceses.all, 'detail', id] as const,
  },

  sectors: {
    all: ['sectors'] as const,
    byDiocese: (dioceseId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.sectors.all, 'by-diocese', dioceseId, filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.sectors.all, 'detail', id] as const,
  },

  users: {
    all: ['users'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },

  audit: {
    all: ['audit'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.audit.all, 'list', filters] as const,
  },

  aiApiLogs: {
    all: ['ai-api-logs'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.aiApiLogs.all, 'list', filters] as const,
  },

  evaluation: {
    all: ['evaluation'] as const,
    analysis: (encounterId: string) => [...queryKeys.evaluation.all, 'analysis', encounterId] as const,
  },

  engagement: {
    all: ['engagement'] as const,
    report: (parishIds: string[]) => [...queryKeys.engagement.all, 'report', ...([...parishIds].sort())] as const,
  },

  hierarchy: {
    all: ['hierarchy'] as const,
    dioceses: () => [...queryKeys.hierarchy.all, 'dioceses'] as const,
    sectors: (dioceseId: string) => [...queryKeys.hierarchy.all, 'sectors', dioceseId] as const,
    parishes: (sectorId: string) => [...queryKeys.hierarchy.all, 'parishes', sectorId] as const,
  },

  importStatus: {
    byKey: (cacheKey: string) => ['import-status', cacheKey] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    stats: (params: Record<string, unknown>) => [...queryKeys.dashboard.all, 'stats', params] as const,
  },
} as const;
