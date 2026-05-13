'use client';
import { useState } from 'react';

export function StarsDisplay({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden>
          {n <= Math.round(value) ? '★' : '☆'}
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">
        {value.toFixed(1)}{count != null ? ` (${count})` : ''}
      </span>
    </div>
  );
}

export function StarsInput({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`transition ${n <= display ? 'text-yellow-500' : 'text-gray-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`Đánh giá ${n} sao`}
        >
          {n <= display ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
