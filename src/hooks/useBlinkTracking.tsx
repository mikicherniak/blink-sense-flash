import { useState, useRef } from 'react';

export const useBlinkTracking = () => {
  const [blinksInLastMinute, setBlinksInLastMinute] = useState<number[]>([]);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [totalBlinks, setTotalBlinks] = useState(0);
  const [monitoringStartTime] = useState(Date.now());
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');

  const getCurrentBlinksPerMinute = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentBlinks = blinksInLastMinute.filter(time => time > oneMinuteAgo);
    return recentBlinks.length;
  };

  const getAverageBlinksPerMinute = () => {
    const now = Date.now();
    const sessionDurationMinutes = (now - monitoringStartTime) / 60000;
    return getCurrentBlinksPerMinute();
  };

  const getSessionDuration = () => {
    const durationMs = Date.now() - monitoringStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBlink = () => {
    const now = Date.now();
    setBlinksInLastMinute(prev => [...prev, now]);
    setLastBlinkTime(now);
    setTotalBlinks(prev => prev + 1);
  };

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