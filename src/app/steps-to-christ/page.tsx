"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import data from "@/data/stepsToChrist.json";
import Link from "next/link";

type Chapter = {
  chapter: number;
  title: string;
  quote: string;
  summary: string;
  date?: string;
};

// ShareButtons component – defined outside the main component to avoid re‑creation on each render
const ShareButtons = ({
  chapter,
  copied,
  onCopy,
}: {
  chapter: Chapter;
  copied: boolean;
  onCopy: () => void;
}) => {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `📖 Steps to Christ – Chapter ${chapter.chapter}: ${chapter.title}\n\n“${chapter.quote.slice(0, 120)}...”\n\nRead the full summary at: ${pageUrl}`;

  return (
    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 self-center">
        Share this chapter:
      </span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800/40 transition"
      >
        📱 WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/40 transition"
      >
        🐦 Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition"
      >
        📘 Facebook
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(`Steps to Christ – Chapter ${chapter.chapter}: ${chapter.title}`)}&body=${encodeURIComponent(shareText)}`}
        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        📧 Email
      </a>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        🔗 {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
};

export default function StepsToChristPage() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const chapters: Chapter[] = data;

  // Dark mode – lazy initializer
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Track if component is mounted (to avoid hydration mismatch)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Apply dark mode class and store preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Manage body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleCards((prev) => [...new Set([...prev, index])]);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const openModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChapter(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Copy link handler
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>Steps to Christ – Chapter Summaries | Stephen Ogaro</title>
        <meta
          name="description"
          content="Complete summaries of each chapter from Steps to Christ by Ellen G. White, with reflections and quotes."
        />
      </Head>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle dark mode"
      >
        {mounted ? (darkMode ? "☀️" : "🌙") : "🌓"}
      </button>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Steps to Christ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Chapter summaries prepared as a spiritual resource for Master Guide
            growth. May these truths deepen your walk with God.
          </p>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.chapter}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              className={`
                transform transition-all duration-500
                ${visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              <div className="group relative h-full border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:-translate-y-1">
                {/* Decorative gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>

                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      Chapter {chapter.chapter}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                    {chapter.title}
                  </h2>
                  <div className="italic border-l-4 border-blue-500 pl-4 my-3 text-gray-600 dark:text-gray-400 text-sm">
                    “{chapter.quote}”
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-4 mb-4">
                    {chapter.summary.replace(/\n/g, " ").slice(0, 200)}…
                  </p>
                  <button
                    onClick={() => openModal(chapter)}
                    className="mt-auto self-start text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group-hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    Read full summary →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && selectedChapter && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  Chapter {selectedChapter.chapter}: {selectedChapter.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="italic border-l-4 border-blue-500 pl-4 mb-6 text-gray-600 dark:text-gray-400">
                  “{selectedChapter.quote}”
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {selectedChapter.summary.split("\n").map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Share buttons */}
                <ShareButtons
                  chapter={selectedChapter}
                  copied={copied}
                  onCopy={handleCopyLink}
                />

                {selectedChapter.date && (
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
                    Read on: {selectedChapter.date}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Contact Section */}
        <section id="contact" className="mb-16 animate-fade-in scroll-mt-24">
          {/* Banner */}
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl text-center mb-8">
            <p className="text-lg font-medium">I’d love to hear from you! 👋</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Whether it&apos;s a project, collaboration, or just a hello.
            </p>
          </div>

          <h2 className="text-3xl font-bold border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-6 inline-block">
            📬 Contact & Booking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/254705001193?text=Hello%20Stephen%2C%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20connect."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <span className="text-4xl group-hover:scale-110 transition">
                📱
              </span>
              <div>
                <h3 className="text-xl font-semibold">WhatsApp</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Send me a message – I&apos;ll reply as soon as possible.
                </p>
                <span className="text-sm text-green-600 dark:text-green-400">
                  +254 705 001 193
                </span>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:stevemagare4@gmail.com?subject=Inquiry%20from%20your%20portfolio&body=Hello%20Stephen%2C%0A%0AI%20saw%20your%20portfolio%20and%20would%20like%20to%20..."
              className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <span className="text-4xl group-hover:scale-110 transition">
                📧
              </span>
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Write to me for any inquiries or collaborations.
                </p>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  stevemagare4@gmail.com
                </span>
              </div>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mt-10">
            <a
              href="https://github.com/maogast"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl hover:scale-110 transition transform"
              title="GitHub"
            >
              🐙
            </a>
            <a
              href="https://linkedin.com/in/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl hover:scale-110 transition transform"
              title="LinkedIn"
            >
              🔗
            </a>
            <a
              href="https://twitter.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl hover:scale-110 transition transform"
              title="Twitter"
            >
              🐦
            </a>
            <a
              href="https://magaredev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl hover:scale-110 transition transform"
              title="Portfolio"
            >
              🌐
            </a>
          </div>
        </section>
        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-20 pt-8 border-t dark:border-gray-800">
          © {new Date().getFullYear()} Stephen Magare Ogaro – Master Guide
          Portfolio
        </footer>
      </main>
    </div>
  );
}
