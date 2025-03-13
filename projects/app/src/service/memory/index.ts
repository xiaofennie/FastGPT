import axios from 'axios';

const CASS_MEMORY_URI = process.env.CASS_MEMORY_URI;

export function getMemory(params: any) {
  return axios.post(`${CASS_MEMORY_URI}/api/v1/memories/_search`, params);
}
