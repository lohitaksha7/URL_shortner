import { useState, useEffect, useRef } from 'react';

function StatsCard({ title, value, icon: Icon, trend, color = 'purple', onClick, isLoading}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  const prevValueRef = useRef(0);
  const colorMap = {
    purple: { bg: 'rgba(124,58,237,0.15)', icon: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
    blue:   { bg: 'rgba(59,130,246,0.15)', icon: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    green:  { bg: 'rgba(52,211,153,0.15)', icon: '#34d399', border: 'rgba(52,211,153,0.25)' },
    orange: { bg: 'rgba(251,146,60,0.15)', icon: '#fb923c', border: 'rgba(251,146,60,0.25)' },
  };
  const colors = colorMap[color] || colorMap.purple;

  // Count-up animation
  useEffect(() => {
    if (!isNumeric) return;

    const startValue = prevValueRef.current;
    const endValue = numericValue;

    if(startValue === endValue){
        setDisplayValue(endValue);
        return ;
    }
    const duration = 800;
    const steps = 40;
    const stepMs = duration / steps;

    let current = startValue;
    const diff = endValue - startValue;
    const increment = diff / steps;
    const timer = setInterval(() => {
      current += increment;

      if(increment>0 && current>=endValue || increment<0 && current<=endValue){
          setDisplayValue(endValue);
          clearInterval(timer);
      }else{
            setDisplayValue(Math.floor(current));
      }
//       if (current >= numericValue) {
//         setDisplayValue(numericValue);
//         clearInterval(timer);
//       } else {
//         setDisplayValue(Math.floor(current));
//       }
    }, stepMs);
    prevValueRef.current = endValue
    return () => clearInterval(timer);
  }, [numericValue, isNumeric]);

  return (
    <div
        onClick={!isLoading?onClick : undefined}
        className="card animate-fade-in"
        style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            {title}
          </p>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-1px',
            }}
          >
            {isNumeric ? displayValue.toLocaleString() : value}
          </h2>
        </div>

        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={colors.icon} />
          </div>
        )}
      </div>

      {trend != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: trend >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>vs last week</span>
        </div>
      )}
    </div>
  );
}

export default StatsCard;