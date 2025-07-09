import React, { useState, useEffect, useRef } from 'react';
import quotes from '../../utils/quotes';
import "./Citate.css";
const QuoteRotator = () => {
  const [current, setCurrent] = useState(() => {
    const i = Math.floor(Math.random() * quotes.length);
    return { index: i, quote: quotes[i] };
  });
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fading-out' | 'fading-in'
  const timeoutRef = useRef(null);

  const getNextIndex = (exclude) => {
    let i;
    do {
      i = Math.floor(Math.random() * quotes.length);
    } while (i === exclude && quotes.length > 1);
    return i;
  };

  useEffect(() => {
    if (phase === 'visible') {
      timeoutRef.current = setTimeout(() => setPhase('fading-out'), 5000);
    }
    if (phase === 'fading-out') {
      timeoutRef.current = setTimeout(() => {
        const nextIdx = getNextIndex(current.index);
        setCurrent({ index: nextIdx, quote: quotes[nextIdx] });
        setPhase('fading-in');
      }, 500);
    }
    if (phase === 'fading-in') {
      timeoutRef.current = setTimeout(() => setPhase('visible'), 500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [phase, current.index]);

  const cls = `qr-quote ${
    phase === 'visible'
      ? 'qr-visible'
      : phase === 'fading-out'
      ? 'qr-fade-out'
      : 'qr-fade-in'
  }`;

  return (
    <div className="quotes-section">
      <div className="qr-container">
        <div className={cls}>
          <p className="qr-text">"{current.quote.text}"</p>
          <p className="qr-author">– {current.quote.author}</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteRotator;
