import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FAQ from '../components/FAQ.jsx';
import { useReveal } from '../hooks/useGSAP.js';

const faqItems = [
  {
    question: "What is CiteMind?",
    answer: "CiteMind is an AI citation memory agent that monitors how AI search engines (like ChatGPT, Perplexity, Gemini) cite your website. Unlike traditional SEO tools that only track rankings, CiteMind remembers every experiment and learns what actually improves your AI visibility over time."
  },
  {
    question: "How does the memory engine work?",
    answer: "CiteMind uses Hindsight, a proprietary memory consolidation engine. Every time you run a citation check, results are stored as memory units. Over time, Hindsight automatically merges and strengthens these into consolidated beliefs — patterns like 'adding schema markup improved citations by 40% for local queries'. These beliefs power the agent's personalized recommendations."
  },
  {
    question: "Which AI search engines does CiteMind track?",
    answer: "CiteMind currently monitors citations across major AI-powered search experiences including ChatGPT (with browsing), Perplexity AI, Google Gemini, and other LLM-based answer engines. The system is designed to be extensible as new AI search platforms emerge."
  },
  {
    question: "What is Share of Model and how is it calculated?",
    answer: "Share of Model is CiteMind's signature metric. It measures how often your website is cited by AI models across your tracked queries compared to competitors. It's calculated as the percentage of queries where your domain appears in the AI-generated response, weighted by citation position and query intent. Think of it like 'Share of Voice' but for the AI search era."
  },
  {
    question: "Is CiteMind free to use?",
    answer: "CiteMind offers a free tier that includes tracking up to 3 sites with basic citation monitoring. The demo mode is always free — you can experience the full memory engine in action without creating an account. Premium plans with expanded tracking, deeper memory analytics, and priority Groq processing are available for teams and agencies."
  },
  {
    question: "How is this different from traditional SEO tools?",
    answer: "Traditional SEO tools track keyword rankings in Google/Bing. CiteMind tracks whether AI models actually cite your website when answering questions. More importantly, CiteMind has memory — it doesn't just show you what's happening now, it remembers what worked before, identifies patterns across experiments, and gives you proof-backed recommendations instead of generic advice."
  }
];

export default function FAQPage() {
  const headerRef = useReveal({ from: 'bottom' });
  const contentRef = useReveal({ delay: 0.15, from: 'bottom' });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      {/* Title section */}
      <div ref={headerRef} className="text-center mb-12 md:mb-16">
        <div className="badge-teal mb-4">
          <span>❔</span> Help Center
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
          Everything you need to know about AI citation tracking, Hindsight memory, and optimizing for answer engines.
        </p>
      </div>

      {/* FAQ Accordion in Glass Card */}
      <div ref={contentRef} className="glass p-6 md:p-10 rounded-2xl shadow-xl mb-12">
        <FAQ items={faqItems} />
      </div>

      {/* CTA Section */}
      <div className="text-center bg-panel2/50 border border-edge rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Ready to track your AI citations?</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Start monitoring ChatGPT, Perplexity, and Gemini citations for your domain today.
        </p>
        <Link to="/register" className="btn-primary">
          Get Started for Free
        </Link>
      </div>
    </main>
  );
}
