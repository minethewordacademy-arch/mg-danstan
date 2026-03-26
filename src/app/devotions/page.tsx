"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import data from "@/data/devotions.json";

type DevotionItem = {
  date: string;
  bibleReading: string;
  materialRead?: string;
  reflection: string;
  application: string;
  prayerFocus: string;
  song: string;
};

export default function DevotionsPage() {
  const [selectedDevotion, setSelectedDevotion] = useState<DevotionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dark mode (same as other pages)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  // Scroll animations
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
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const openModal = (devotion: DevotionItem) => {
    setSelectedDevotion(devotion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDevotion(null);
  };

  // Escape key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>30‑Day Devotion Challenge | Danstan Toel</title>
        <meta
          name="description"
          content="Daily devotions from the 30‑day challenge – reflections, applications, and prayers."
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

      {/* Back to Home link using Next.js Link */}
      <div className="container mx-auto px-4 pt-6 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          ← Back to Home
        </Link>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            30‑Day Devotion Challenge
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Daily reflections, applications, and prayers – a journey through the 30‑day devotion challenge.
          </p>
        </div>

        {/* Grid of devotion cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((devotion, index) => (
            <div
              key={index}
              ref={(el) => { cardRefs.current[index] = el; }}
              data-index={index}
              className={`
                transform transition-all duration-500
                ${visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              <div className="group relative h-full border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      {formatDate(devotion.date)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                    {devotion.bibleReading}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
                    {devotion.reflection}
                  </p>
                  <button
                    onClick={() => openModal(devotion)}
                    className="mt-auto self-start text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group-hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    Read full devotion →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && selectedDevotion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  {formatDate(selectedDevotion.date)}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">📖 Bible Reading</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedDevotion.bibleReading}</p>
                </div>
                {selectedDevotion.materialRead && (
                  <div>
                    <h3 className="font-semibold text-lg">📚 Material Read</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedDevotion.materialRead}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">💭 Reflection</h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedDevotion.reflection}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">✅ Application</h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedDevotion.application}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">🙏 Prayer Focus</h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedDevotion.prayerFocus}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">🎵 Song</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedDevotion.song}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-20 pt-8 border-t dark:border-gray-800">
          © {new Date().getFullYear()} Danstan Toel – Master Guide Portfolio
        </footer>
      </main>
    </div>
  );
}