import React from 'react';
import type { PluginComponentProps } from './hs-plugin';
import { frame, ink, caps, Icon, I, sdk, useNow, dayKey } from './ui';

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
  return (
    <div style={frame(style, { justifyContent: 'center', gap: '0.6em' })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9em' }}>
        <div style={{ width: '3em', height: '3em', borderRadius: '50%', background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: today?.emoji ? '1.1em' : '1em' }}>
          {today?.emoji ? <span style={{ fontSize: '1.6em' }}>{today.emoji}</span> : <Icon d={I.utensils} size="1.5em" stroke={1.8} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={caps}>{title}</div>
          <div style={{ fontSize: '1.8em', fontWeight: 600, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: today ? 1 : 0.4 }}>{today?.name || 'Nothing planned yet'}</div>
          {today && (today.tags.length > 0 || today.prep) && (
            <div style={{ display: 'flex', gap: '0.35em', marginTop: '0.3em', flexWrap: 'wrap' }}>
              {today.prep ? <span style={{ fontSize: '0.65em', padding: '0.2em 0.6em', borderRadius: '0.4em', background: ink(style, 0.07) }}>{today.prep} min</span> : null}
              {today.tags.slice(0, 3).map((t) => <span key={t} style={{ fontSize: '0.65em', padding: '0.2em 0.6em', borderRadius: '0.4em', background: ink(style, 0.07) }}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.8em', opacity: 0.55, paddingLeft: '5.15em' }}>{tmr ? <>Tomorrow: <span style={{ fontWeight: 500 }}>{tmr.emoji ? tmr.emoji + ' ' : ''}{tmr.name}</span></> : !today ? 'Plan meals from a phone: the Home Screens remote → Meals' : 'Tomorrow: not planned'}</div>
    </div>
  );
}
