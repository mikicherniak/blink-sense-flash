import { useState, useRef, useCallback } from 'react';

export const useBlinkTracking = () => {
  const [blinksInLastMinute, setBlinksInLastMinute] = useState<number[]>([]);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [totalBlinks, setTotalBlinks] = useState(0);
  const [monitoringStartTime] = useState(Date.now());
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');

  const getCurrentBlinksPerMinute = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentBlinks = blinksInLastMinute.filter(time => time > oneMinuteAgo);
    return recentBlinks.length;
  }, [blinksInLastMinute]);

  const getAverageBlinksPerMinute = useCallback(() => {
    const now = Date.now();
    const sessionDurationMinutes = (now - monitoringStartTime) / 60000;
    if (sessionDurationMinutes < 0.1) return 0;
    return Math.round(totalBlinks / sessionDurationMinutes);
  }, [totalBlinks, monitoringStartTime]);

  const getSessionDuration = useCallback(() => {
    const durationMs = Date.now() - monitoringStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [monitoringStartTime]);

  const handleBlink = useCallback(() => {
    const now = Date.now();
    setBlinksInLastMinute(prev => [...prev, now]);
    setLastBlinkTime(now);
    setTotalBlinks(prev => prev + 1);
    console.log('Blink detected! Total blinks:', totalBlinks + 1);
  }, [totalBlinks]);

  return {
    blinksInLastMinute,
    setBlinksInLastMinute,
    lastBlinkTime,
    totalBlinks,
    monitoringStartTime,
    lastEyeStateRef,
    getCurrentBlinksPerMinute,
    getAverageBlinksPerMinute,
    getSessionDuration,
    handleBlink
  };
};