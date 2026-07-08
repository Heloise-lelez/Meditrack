import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // montée en charge
    { duration: '1m', target: 50 }, // charge stable
    { duration: '30s', target: 0 }, // descente
  ],
};
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/documents/heavy-report`);
  console.log(`Status: ${res.status}, Body: ${res.body ? res.body.substring(0, 200) : 'empty'}`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
