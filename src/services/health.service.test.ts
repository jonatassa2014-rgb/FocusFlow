import { describe, it, expect } from 'vitest';
import { healthService } from './health.service';

describe('healthService', () => {
  it('should return a valid health status object', async () => {
    const health = await healthService.checkHealth();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('isCloudConnected');
    expect(health).toHaveProperty('latencyMs');
    expect(health).toHaveProperty('checks');
    expect(typeof health.latencyMs).toBe('number');
    expect(['healthy', 'degraded', 'offline']).toContain(health.status);
  });
});
