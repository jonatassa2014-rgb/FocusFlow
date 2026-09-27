import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const scheduleRoutineNotifications = () => {
    if (permission !== 'granted') return;

    // We can't perfectly schedule background push notifications just with Web Notification API without a Service Worker.
    // However, for an active browser session, we can calculate time until the next trigger and use setTimeout.
    
    // 1. Morning Ritual: every day at 07:00 AM
    scheduleNext('Ritual Matinal', 'Hora de ler sua visão e focar no dia!', 7, 0);

    // 2. WAM Meeting: Friday at 16:00
    scheduleNext('Reunião WAM', 'Hora de homologar o Placar WAM com seu parceiro de responsabilidade.', 16, 0, 5); // 5 = Friday
  };

  const scheduleNext = (title: string, body: string, hour: number, minute: number, dayOfWeek?: number) => {
    const now = new Date();
    let target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (dayOfWeek !== undefined) {
      // Find next occurrence of that day of week
      const currentDay = target.getDay();
      const distance = (dayOfWeek + 7 - currentDay) % 7;
      target.setDate(target.getDate() + distance);
      
      // If it's today but already passed, add 7 days
      if (distance === 0 && target <= now) {
        target.setDate(target.getDate() + 7);
      }
    } else {
      // If time has passed today, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
    }

    const delay = target.getTime() - now.getTime();
    
    // Clear previous timeouts for this specific notification (simplification)
    // A robust implementation would store timer IDs and clear them on unmount
    setTimeout(() => {
      new Notification(title, { body, icon: '/favicon.ico' });
      // Reschedule for next time
      scheduleNext(title, body, hour, minute, dayOfWeek);
    }, delay);
  };

  return { permission, requestPermission, scheduleRoutineNotifications };
}
