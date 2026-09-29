import React from 'react';
import type { PluginComponentProps } from './hs-plugin';
import { frame, ink, caps, Icon, I, sdk, useNow, dayKey, Fit, useBox, clampLines } from './ui';

type Meal = { id: string; name: string; emoji?: string; tags?: string[]; prepTime?: number };
type Plan = { date: string; slot: string; mealId?: string; customText?: string; notes?: string; time?: string };

export default function DinnerTonight({ config, style, timezone: tz }: PluginComponentProps) {
  const now = useNow(60000);
  const slot = String(config.slot || 'dinner');
  const accent = String(config.accentColor || '#b45309');
  const useFetchData = sdk()?.useFetchData;
  const [data] = useFetchData ? useFetchData('/api/meals/data', 300000) : [null];
  const meals: Meal[] = data?.savedMeals ?? []; const plan: Plan[] = data?.plan ?? [];
  const find = (d: string) => { const p = plan.find((x) => x.date === d && x.slot === slot); if (!p) return null; const m = meals.find((x) => x.id === p.mealId); return { name: m?.name ?? p.customText ?? '', emoji: m?.emoji, tags: m?.tags ?? [], prep: m?.prepTime, notes: p.notes }; };
  const today = find(dayKey(now, tz)); const tmr = find(dayKey(new Date(now.getTime() + 86400000), tz));
  const title = slot === 'dinner' ? 'Dinner tonight' : slot === 'lunch' ? 'Lunch today' : 'Breakfast';
  const [box, size] = useBox<HTMLDivElement>();
  const fs = Number(style?.fontSize) || 18;
  // Narrow or tall blocks stack the icon above the text; wide ones keep it beside.
  const stacked = size.w > 0 && (size.w < fs * 16 || size.h > size.w * 1.1);
  const name = today?.name || 'Nothing planned yet';
  const titleSize = name.length > 34 ? '1.35em' : name.length > 20 ? '1.55em' : '1.8em';
  const badge = (
    <div style={{ width: '3em', height: '3em', borderRadius: '50%', background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: today?.emoji ? '1.1em' : '1em' }}>
      {today?.emoji ? <span style={{ fontSize: '1.6em' }}>{today.emoji}</span> : <Icon d={I.utensils} size="1.5em" stroke={1.8} />}
    </div>
  );
  const chips = today && (today.tags.length > 0 || today.prep) ? (
    <div style={{ display: 'flex', gap: '0.35em', marginTop: '0.4em', flexWrap: 'wrap', justifyContent: stacked ? 'center' : undefined }}>
      {today.prep ? <span style={{ fontSize: '0.65em', padding: '0.2em 0.6em', borderRadius: '0.4em', background: ink(style, 0.07) }}>{today.prep} min</span> : null}
      {today.tags.slice(0, 3).map((t) => <span key={t} style={{ fontSize: '0.65em', padding: '0.2em 0.6em', borderRadius: '0.4em', background: ink(style, 0.07) }}>{t}</span>)}
    </div>
  ) : null;
  const tomorrow = (
    <div style={{ fontSize: '0.8em', opacity: 0.55, marginTop: '0.6em', ...clampLines(2) }}>
      {tmr ? <>Tomorrow: <span style={{ fontWeight: 500 }}>{tmr.emoji ? tmr.emoji + ' ' : ''}{tmr.name}</span></> : !today ? 'Plan meals from a phone: the Home Screens remote → Meals' : 'Tomorrow: not planned'}
    </div>
  );
  const text = (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={caps}>{title}</div>
      <div style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 1.15, marginTop: '0.1em', opacity: today ? 1 : 0.4, ...clampLines(5) }}>{name}</div>
      {chips}
    </div>
  );
  return (
    <div ref={box} style={frame(style)}>
      <Fit max={1.7}>
        {stacked ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6em' }}>
            {badge}{text}{tomorrow}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9em' }}>{badge}{text}</div>
            <div style={{ paddingLeft: '4.2em' }}>{tomorrow}</div>
          </div>
        )}
      </Fit>
    </div>
  );
}
