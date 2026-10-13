import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import '../../css/TextAnimation.css';

const TextAnimation = ({
  children,
  containerClassName = "",
  textClassName = "",
  delay = 0.5
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split("").map((char, index) => (
      <span className="char" key={index}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const charElements = el.querySelectorAll('.char');

    gsap.set(charElements, {
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: '50% 0%'
    });

    gsap.to(charElements, {
      duration: 1,
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger: 0.05,
      ease: "back.out(1.7)",
      delay: delay
    });
  }, [delay]);

  return (
    <h2 ref={containerRef} className={`text-animation ${containerClassName}`}>
      <span className={`text-animation-text ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
};

export default TextAnimation; 