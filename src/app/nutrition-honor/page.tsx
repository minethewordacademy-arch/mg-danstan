"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
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

export default function NutritionHonorPage() {
  const [mounted, setMounted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
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
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
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
      { threshold: 0.3, rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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

  const copySectionContent = (section: Section) => {
    // Extract all text from a section (simple version – could be improved)
    const extractText = (content: SectionContent[]): string => {
      let text = "";
      for (const item of content) {
        if (item.type === "text") text += item.value + "\n";
        else if (item.type === "list") text += item.items.join("\n") + "\n";
        else if (item.type === "table") {
          const headers = item.headers.join(" | ");
          const rows = item.rows.map((row) => row.join(" | ")).join("\n");
          text += `${headers}\n${rows}\n`;
        } else if (item.type === "subheading") text += item.value + "\n";
      }
      return text;
    };

    let sectionText = `${section.title}\n\n`;
    if (section.subsections) {
      for (const sub of section.subsections) {
        if (sub.title) sectionText += `${sub.title}\n`;
        if (sub.content) sectionText += extractText(sub.content);
        sectionText += "\n";
      }
    } else if (section.content) {
      sectionText += extractText(section.content);
    }

    navigator.clipboard.writeText(sectionText);
    setCopiedSection(section.title);
    setTimeout(() => setCopiedSection(null), 2000);
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
                    <th key={idx} className="border px-4 py-2 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                 </tr>
              </thead>
              <tbody>
                {content.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
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
        return <h3 className="text-xl font-semibold mt-4 mb-2">{content.value}</h3>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>Nutrition Honor – Study Guide | Danstan Toel</title>
        <meta
          name="description"
          content="Complete study guide for the Pathfinder Nutrition Honor, covering food pyramid, vegetarian diets, vitamins, and more."
        />
      </Head>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Toggle dark mode"
      >
        {mounted ? (darkMode ? "☀️" : "🌙") : "🌓"}
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      {/* Sticky Header with Section Pills */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              ← Home
            </Link>
            <button
              onClick={() => window.print()}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              🖨️ Print
            </button>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === item.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-linear-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            {data.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete study guide for the Pathfinder Nutrition Honor. Based on the official requirements and the SDA Zimmerman Nutrition Honor document.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            📅 Taught on: March 22nd & 25th 2026
          </div>
        </div>

        {/* Sections – staggered cards with copy button */}
        {sections.map((section, idx) => {
          const sectionId = slugify(section.title);
          const emoji = getSectionEmoji(section.title);
          const isEven = idx % 2 === 0;
          return (
            <section
              key={idx}
              id={sectionId}
              ref={(el) => { if (el) sectionRefs.current[sectionId] = el; }}
              className="mb-12 scroll-mt-24"
            >
              <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-6 items-start group`}>
                {/* Large Emoji */}
                <div className="shrink-0 text-6xl md:text-7xl text-primary-500 dark:text-primary-400">
                  {emoji}
                </div>
                {/* Content Card */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-white">
                        {section.title}
                      </h2>
                      <button
                        onClick={() => copySectionContent(section)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        {copiedSection === section.title ? "Copied!" : "📋 Copy section"}
                      </button>
                    </div>
                    {section.subsections ? (
                      section.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="mb-6">
                          {sub.title && <h3 className="text-xl font-semibold mb-2">{sub.title}</h3>}
                          {sub.content && sub.content.map((c, cIdx) => (
                            <div key={cIdx}>{renderContent(c)}</div>
                          ))}
                        </div>
                      ))
                    ) : section.content ? (
                      section.content.map((c, cIdx) => (
                        <div key={cIdx}>{renderContent(c)}</div>
                      ))
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-20 pt-8 border-t dark:border-gray-800">
          © {new Date().getFullYear()} Danstan Toel – Master Guide Portfolio
        </footer>
      </main>
    </div>
  );
}