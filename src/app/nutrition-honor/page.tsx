"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import data from "@/data/nutritionHonor.json";

type SectionContent =
  | { type: "text"; value: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "subheading"; value: string };

type Subsection = {
  title?: string;
  content?: SectionContent[];
};

type Section = {
  title: string;
  subsections?: Subsection[];
  content?: SectionContent[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

// ShareButtons component now receives pageUrl as a prop
const ShareButtons = ({
  title,
  copied,
  onCopy,
  pageUrl,
}: {
  title: string;
  copied: boolean;
  onCopy: () => void;
  pageUrl: string;
}) => {
  const shareText = `📖 Nutrition Honor Study Guide – ${title}\n\nCheck out this complete study guide for the Pathfinder Nutrition Honor. ${pageUrl}`;

  return (
    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 self-center">
        Share this page:
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
        href={`mailto:?subject=${encodeURIComponent("Nutrition Honor Study Guide")}&body=${encodeURIComponent(shareText)}`}
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

export default function NutritionHonorPage() {
  const [mounted, setMounted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pageUrl, setPageUrl] = useState(""); // ← new state for client‑side URL
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Set the actual page URL only on the client
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      setShowBackToTop(winScroll > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for active section
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sections = data.sections as Section[];
  const tocItems = sections.map((section, idx) => ({
    id: slugify(section.title),
    title: section.title,
    index: idx,
  }));

  // Map section titles to emojis
  const getSectionEmoji = (title: string): string => {
    if (title.includes("Food Pyramid")) return "🥗";
    if (title.includes("Vegetarian Diets")) return "🌱";
    if (title.includes("Menu")) return "🍽️";
    if (title.includes("Vitamins")) return "💊";
    if (title.includes("Food Sources")) return "🥕";
    if (title.includes("Water")) return "💧";
    if (title.includes("Diseases")) return "❤️";
    if (title.includes("Flour")) return "🌾";
    if (title.includes("RDA")) return "📊";
    return "📘";
  };

  const renderContent = (content: SectionContent) => {
    switch (content.type) {
      case "text":
        return <p className="mb-4 whitespace-pre-line">{content.value}</p>;
      case "list":
        return (
          <ul className="list-disc pl-6 mb-4 space-y-1">
            {content.items.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
      case "table":
        return (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  {content.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="border px-4 py-2 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "subheading":
        return (
          <h3 className="text-xl font-semibold mt-4 mb-2">{content.value}</h3>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>Nutrition Honor – Study Guide | Stephen Ogaro</title>
        <meta
          name="description"
          content="Complete study guide for the Pathfinder Nutrition Honor, covering food pyramid, vegetarian diets, vitamins, and more."
        />
      </Head>

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle dark mode"
      >
        {mounted ? (darkMode ? "☀️" : "🌙") : "🌓"}
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      {/* Table of Contents (Sticky) */}
      <div className="hidden lg:block fixed left-4 top-24 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 z-30 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📑</span> Contents
        </h3>
        <ul className="space-y-2 text-sm">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 ${
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : ""
                }`}
              >
                <span className="text-base">{getSectionEmoji(item.title)}</span>
                <span className="line-clamp-2">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section with Image */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative w-full max-w-md mx-auto mb-6">
            <Image
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"
              alt="Healthy food pyramid illustration"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl object-cover"
              loading="eager" // improves LCP
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {data.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete study guide for the Pathfinder Nutrition Honor. Based on
            the official requirements and the SDA Zimmerman Nutrition Honor
            document.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            📅 Taught on: March 22nd & 25th 2026
          </div>
        </div>

        <ShareButtons
          title="Nutrition Honor Study Guide"
          copied={copied}
          onCopy={handleCopyLink}
          pageUrl={pageUrl}
        />

        {/* Sections */}
        {sections.map((section, idx) => {
          const sectionId = slugify(section.title);
          const emoji = getSectionEmoji(section.title);
          return (
            <section
              key={idx}
              id={sectionId}
              ref={(el) => {
                if (el) sectionRefs.current[sectionId] = el;
              }}
              className="mb-10 scroll-mt-24"
            >
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Decorative gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <span className="text-2xl">{emoji}</span>
                    <span>{section.title}</span>
                  </h2>
                  {section.subsections
                    ? section.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="mb-6">
                          {sub.title && (
                            <h3 className="text-xl font-semibold mb-2">
                              {sub.title}
                            </h3>
                          )}
                          {sub.content &&
                            sub.content.map((c, cIdx) => (
                              <div key={cIdx}>{renderContent(c)}</div>
                            ))}
                        </div>
                      ))
                    : section.content
                      ? section.content.map((c, cIdx) => (
                          <div key={cIdx}>{renderContent(c)}</div>
                        ))
                      : null}
                </div>
              </div>
            </section>
          );
        })}

        <ShareButtons
          title="Nutrition Honor Study Guide"
          copied={copied}
          onCopy={handleCopyLink}
          pageUrl={pageUrl}
        />

        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-20 pt-8 border-t dark:border-gray-800">
          © {new Date().getFullYear()} Stephen Magare Ogaro – Master Guide
          Portfolio
        </footer>
      </main>
    </div>
  );
}
