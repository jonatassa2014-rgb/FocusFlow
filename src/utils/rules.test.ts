import { describe, it, expect } from 'vitest';
import { calculateWAM, validateLeadIndicator, calculateDurationMinutes } from './rules';
import { Tactic } from '../types';

describe('calculateWAM', () => {
  it('should return 100% and gold status when there are no tactics', () => {
    const result = calculateWAM([]);
    expect(result.score).toBe(100);
    expect(result.status).toBe('gold');
    expect(result.executed).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should correctly calculate 100% score (Gold)', () => {
    const tactics: Tactic[] = [
      { id: '1', goalId: 'g1', title: 'A', isCompleted: true, daysOfWeek: ['seg'] },
      { id: '2', goalId: 'g1', title: 'B', isCompleted: true, daysOfWeek: ['ter'] },
    ];
    const result = calculateWAM(tactics);
    expect(result.score).toBe(100);
    expect(result.status).toBe('gold');
  });

  it('should correctly calculate 85% score (Gold)', () => {
    const tactics = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      goalId: 'g1',
      title: 'A',
      isCompleted: i < 17, // 17/20 = 85%
      daysOfWeek: ['seg']
    })) as Tactic[];
    
    const result = calculateWAM(tactics);
    expect(result.score).toBe(85);
    expect(result.status).toBe('gold');
  });

  it('should correctly calculate 70% score (Alert)', () => {
    const tactics = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      goalId: 'g1',
      title: 'A',
      isCompleted: i < 7, // 7/10 = 70%
      daysOfWeek: ['seg']
    })) as Tactic[];
    
    const result = calculateWAM(tactics);
    expect(result.score).toBe(70);
    expect(result.status).toBe('alert');
  });

  it('should correctly calculate 69% score (Risk)', () => {
    const tactics = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      goalId: 'g1',
      title: 'A',
      isCompleted: i < 69, // 69/100 = 69%
      daysOfWeek: ['seg']
    })) as Tactic[];
    
    const result = calculateWAM(tactics);
    expect(result.score).toBe(69);
    expect(result.status).toBe('risk');
  });
});

describe('validateLeadIndicator', () => {
  it('should return isValid true for lead indicators', () => {
    expect(validateLeadIndicator('Fazer 10 ligações').isValid).toBe(true);
    expect(validateLeadIndicator('Escrever 2 páginas').isValid).toBe(true);
    expect(validateLeadIndicator('Publicar 1 post').isValid).toBe(true);
  });

  it('should return isValid false for lag indicators', () => {
    const result = validateLeadIndicator('Fechar 5 contratos');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Lag Indicator');
    
    expect(validateLeadIndicator('Bater meta do mês').isValid).toBe(false);
    expect(validateLeadIndicator('Ganhar dinheiro com vendas').isValid).toBe(false);
    expect(validateLeadIndicator('receber aprovação do chefe').isValid).toBe(false);
  });
});

describe('calculateDurationMinutes', () => {
  it('should calculate duration correctly within the same day', () => {
    expect(calculateDurationMinutes('09:00', '10:30')).toBe(90);
    expect(calculateDurationMinutes('13:15', '14:00')).toBe(45);
    expect(calculateDurationMinutes('00:00', '23:59')).toBe(1439);
  });

  it('should calculate duration correctly across midnight', () => {
    expect(calculateDurationMinutes('23:00', '01:00')).toBe(120);
    expect(calculateDurationMinutes('22:30', '00:30')).toBe(120);
  });
});
