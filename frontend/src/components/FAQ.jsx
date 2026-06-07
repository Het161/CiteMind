import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    if (isOpen) {
      gsap.to(body, {
        height: 'auto',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else {
      gsap.to(body, {
        height: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    }
  }, [isOpen]);

  return (
    <div className="faq-item">
      <dt>
        <button
          type="button"
          className={`faq-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{question}</span>
          <span className="faq-icon" aria-hidden="true">+</span>
        </button>
      </dt>
      <dd
        ref={bodyRef}
        className="faq-body"
        style={{ height: 0, overflow: 'hidden', transition: 'none' }}
      >
        <div className="faq-body-inner">
          {answer}
        </div>
      </dd>
    </div>
  );
}

export default function FAQ({ items }) {
  return (
    <section>
      <dl>
        {items.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </dl>
    </section>
  );
}
