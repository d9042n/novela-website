import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Headphones, Volume2, VolumeX, Wind, CloudRain } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { cn } from '../ui/utils';

export type SoundscapeType = 'off' | 'rain' | 'fire' | 'wind';

export function SoundscapesPlayer() {
  const { t } = useTranslation();
  const [activeSound, setActiveSound] = useState<SoundscapeType>('off');
  const [volume, setVolume] = useState<number>(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeSourceRef = useRef<AudioNode | null>(null);

  // Khởi tạo AudioContext khi cần
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Tạo pink noise cho tiếng mưa
  const createRainNoise = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter tiếng mưa trầm dịu
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    noiseSource.connect(filter);
    return { source: noiseSource, output: filter };
  };

  // Tạo tiếng lửa reo lách tách
  const createFireNoise = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Crackle pops
      const isPop = Math.random() < 0.003;
      data[i] = isPop ? (Math.random() * 2 - 1) * 0.7 : (Math.random() * 2 - 1) * 0.03;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noiseSource.connect(filter);
    return { source: noiseSource, output: filter };
  };

  // Tạo tiếng gió vi vu
  const createWindNoise = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 450;
    filter.Q.value = 3.0;

    noiseSource.connect(filter);
    return { source: noiseSource, output: filter };
  };

  // Cập nhật âm thanh khi activeSound thay đổi
  useEffect(() => {
    if (activeSound === 'off') {
      if (activeSourceRef.current) {
        try {
          (activeSourceRef.current as AudioScheduledSourceNode).stop();
        } catch {
          // ignore
        }
        activeSourceRef.current = null;
      }
      return;
    }

    const ctx = getAudioContext();

    // Dừng âm thanh trước nếu có
    if (activeSourceRef.current) {
      try {
        (activeSourceRef.current as AudioScheduledSourceNode).stop();
      } catch {
        // ignore
      }
      activeSourceRef.current = null;
    }

    // Master Gain
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.connect(ctx.destination);
    }
    gainNodeRef.current.gain.value = volume;

    let soundNode: { source: AudioBufferSourceNode; output: AudioNode } | null = null;
    if (activeSound === 'rain') soundNode = createRainNoise(ctx);
    if (activeSound === 'fire') soundNode = createFireNoise(ctx);
    if (activeSound === 'wind') soundNode = createWindNoise(ctx);

    if (soundNode) {
      soundNode.output.connect(gainNodeRef.current);
      soundNode.source.start(0);
      activeSourceRef.current = soundNode.source;
    }

    return () => {
      if (activeSourceRef.current) {
        try {
          (activeSourceRef.current as AudioScheduledSourceNode).stop();
        } catch {
          // ignore
        }
        activeSourceRef.current = null;
      }
    };
  }, [activeSound]);

  // Cập nhật âm lượng
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Dọn dẹp audio context khi unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  const sounds: { id: SoundscapeType; label: string; icon: typeof CloudRain }[] = [
    { id: 'off', label: t('soundscapes.off'), icon: VolumeX },
    { id: 'rain', label: t('soundscapes.rain'), icon: CloudRain },
    { id: 'fire', label: t('soundscapes.fire'), icon: Flame },
    { id: 'wind', label: t('soundscapes.wind'), icon: Wind },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-8 transition-colors rounded-full',
            activeSound !== 'off' ? 'text-primary bg-primary/10' : 'opacity-80 hover:opacity-100',
          )}
          style={{ color: 'var(--reader-fg)' }}
          title={t('soundscapes.title')}
          aria-label={t('soundscapes.title')}
        >
          {activeSound === 'off' ? (
            <Headphones className="size-4.5" />
          ) : (
            <Volume2 className="size-4.5 text-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-64 border-border/80 bg-background/95 p-3 backdrop-blur-xl shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Headphones className="size-3.5 text-primary" />
            {t('soundscapes.title')}
          </span>
          {activeSound !== 'off' && (
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>

        {/* Danh sách các âm thanh */}
        <div className="grid grid-cols-2 gap-1.5">
          {sounds.map((s) => {
            const Icon = s.icon;
            const active = activeSound === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSound(s.id)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border',
                  active
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border/40 hover:bg-accent/60 text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'opacity-70')} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Thanh chỉnh âm lượng nếu đang bật */}
        {activeSound !== 'off' && (
          <div className="pt-2 border-t border-border/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t('soundscapes.volume')}</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([val]) => setVolume(val)}
              className="py-1 cursor-pointer"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
