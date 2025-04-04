import { useState, useEffect } from 'react';

const LAST_MINUTE_THRESHOLD = 60;

export function useClockSound(
  gameActive: boolean,
  gameEndTime: bigint,
  disableSound: boolean = false, // New feature flag, defaults to false (sound enabled)
) {
  // Only create Audio object if sound is not disabled
  const [clockAudio] = useState(() => {
    if (disableSound || typeof Audio === 'undefined') {
      return null;
    }
    try {
      const audio = new Audio('/clock-tick.mp3');
      audio.volume = 0.5;
      audio.preload = 'auto';
      return audio;
    } catch (error) {
      console.error('Failed to create Audio object:', error);
      return null;
    }
  });

  const [timeRemaining, setTimeRemaining] = useState('0:00');
  const [audioBlocked, setAudioBlocked] = useState(false);
  const testMode = false;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const effectiveEndTime = testMode ? now + 30 : Number(gameEndTime);
      const timeLeft = effectiveEndTime - now;

      // Time remaining logic (always active)
      setTimeRemaining(
        testMode || timeLeft > 0 ? formatTime(timeLeft) : '0:00',
      );

      // Audio logic (only if sound is not disabled)
      if (!disableSound && clockAudio) {
        const shouldPlay = testMode
          ? true
          : timeLeft <= LAST_MINUTE_THRESHOLD && timeLeft > 0;

        if (shouldPlay && !audioBlocked) {
          clockAudio.loop = true;
          clockAudio
            .play()
            .then(() => {
              setAudioBlocked(false);
            })
            .catch((error) => {
              if (error.name === 'NotAllowedError' && !audioBlocked) {
                setAudioBlocked(true);
                alert(
                  'Audio cannot autoplay because the browser requires user interaction. Please click OK and interact with the page to enable sound.',
                );
              }
            });
        } else if (!shouldPlay && clockAudio.played) {
          clockAudio.pause();
          clockAudio.currentTime = 0;
        }
      }
    }, 1000);

    // Immediate audio start in testMode (only if sound is not disabled)
    if (!disableSound && testMode && clockAudio && !audioBlocked) {
      clockAudio.loop = true;
      clockAudio.play().catch((error) => {
        if (error.name === 'NotAllowedError' && !audioBlocked) {
          setAudioBlocked(true);
          alert(
            'Audio cannot autoplay because the browser requires user interaction. Please click OK and interact with the page to enable sound.',
          );
        }
      });
    }

    return () => {
      clearInterval(interval);
      if (!disableSound && clockAudio) {
        clockAudio.pause();
        clockAudio.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive, gameEndTime, clockAudio, audioBlocked, disableSound]);

  // Reset audio blocked state (only if sound is not disabled)
  const resetAudioBlocked = () => {
    if (!disableSound && audioBlocked) {
      setAudioBlocked(false);
      if (clockAudio) {
        clockAudio.play().catch((error) => {
          console.error('Error retrying audio after reset:', error);
        });
      }
    }
  };

  return { timeRemaining, audioBlocked, resetAudioBlocked };
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
