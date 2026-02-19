import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

export const sessionApi = {
  start: (mode: string) => api.post('/session/start', { mode }),
  step: (sessionId: string) => api.post(`/session/${sessionId}/step`),
  get: (sessionId: string) => api.get(`/session/${sessionId}`),
  getGraph: (sessionId: string) => api.get(`/session/${sessionId}/graph`),
  getMetrics: (sessionId: string) => api.get(`/session/${sessionId}/metrics`),
  getTimeline: (sessionId: string) => api.get(`/session/${sessionId}/timeline`),
  replay: (sessionId: string) => api.post(`/session/${sessionId}/replay`),
  listSessions: () => api.get('/sessions'),
}

export default api
