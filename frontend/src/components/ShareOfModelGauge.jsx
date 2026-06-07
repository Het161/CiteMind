import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function color(v) {
  if (v >= 60) return '#2dd4bf';
  if (v >= 30) return '#fbbf24';
  return '#fb7185';
}

export default function ShareOfModelGauge({ value = 0, size = 140, label = true }) {
  const v = Math.round(value);
  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbarWithChildren
        value={v}
        styles={buildStyles({
          pathColor: color(v),
          trailColor: '#1c2230',
          strokeLinecap: 'round',
        })}
      >
        <div className="text-center">
          <div className="text-3xl font-extrabold" style={{ color: color(v) }}>
            {v}%
          </div>
          {label && <div className="text-[10px] uppercase tracking-widest text-slate-400">Share of Model</div>}
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
}
