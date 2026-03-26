"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import data from "@/data/portfolio.json";

// ----- Types (unchanged) -----
type ShareOption = { label: string; url: string };
type EventItem = { name: string; date: string; description: string };
type BaseItem = { title: string };
type ItemWithShare = BaseItem & { shareOptions: ShareOption[] };
type ItemWithEvents = BaseItem & { events: EventItem[] };
type ItemWithImages = BaseItem & { description?: string; images: string[] };
type ItemWithLink = BaseItem & { description?: string; link: string };
type ItemSimple = string;
type PortfolioItem =
  | ItemSimple
  | ItemWithShare
  | ItemWithEvents
  | ItemWithImages
  | ItemWithLink;

type DevotionItem = {
  date: string;
  bibleReading: string;
  materialRead?: string;
  reflection: string;
  application: string;
  prayerFocus: string;
  song: string;
};

type Section = {
  title: string;
  type: "list" | "cards" | "devotion-list";
  items: PortfolioItem[] | DevotionItem[];
};

// Type guards (unchanged)
function isListSection(
  section: unknown,
): section is Section & { type: "list" } {
  return (
    typeof section === "object" &&
    section !== null &&
    "type" in section &&
    (section as { type: string }).type === "list"
  );
}
function isCardsSection(
  section: unknown,
): section is Section & { type: "cards" } {
  return (
    typeof section === "object" &&
    section !== null &&
    "type" in section &&
    (section as { type: string }).type === "cards"
  );
}
function isDevotionListSection(
  section: Section,
): section is Section & { type: "devotion-list"; items: DevotionItem[] } {
  return section.type === "devotion-list";
}
function isStringItem(item: PortfolioItem): item is string {
  return typeof item === "string";
}
function hasShareOptions(item: PortfolioItem): item is ItemWithShare {
  return typeof item === "object" && "shareOptions" in item;
}
function hasEvents(item: PortfolioItem): item is ItemWithEvents {
  return typeof item === "object" && "events" in item;
}
function hasImages(item: PortfolioItem): item is ItemWithImages {
  return typeof item === "object" && "images" in item;
}
function hasLink(item: PortfolioItem): item is ItemWithLink {
  return typeof item === "object" && "link" in item;
}
function hasDescription(
  item: PortfolioItem,
): item is Exclude<PortfolioItem, string> & { description?: string } {
  return typeof item === "object" && "description" in item;
}
function getTitle(item: PortfolioItem): string {
  return isStringItem(item) ? item : item.title;
}

// Helper to slugify section titles for IDs
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export default function Home() {
  const [selectedDevotion, setSelectedDevotion] = useState<DevotionItem | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Lightbox state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Dark mode – lazy initializer (client only)
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

  // Back-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for active section highlighting
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

  // Close mobile menu on link click (smooth scroll)
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openDetailModal = (devotion: DevotionItem) => {
    setSelectedDevotion(devotion);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDevotion(null);
  };
  const openListModal = () => setIsListModalOpen(true);
  const closeListModal = () => setIsListModalOpen(false);

  // Lightbox functions
  const openImageModal = (src: string) => {
    setSelectedImage(src);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const devotionSection = (data.sections as Section[]).find(
    (s) => s.type === "devotion-list",
  ) as (Section & { type: "devotion-list"; items: DevotionItem[] }) | undefined;

  // Build navigation items
  const navItems = [
    { id: "hero", label: "Home" },
    ...(data.dedication ? [{ id: "dedication", label: "Dedication" }] : []),
    ...(data.sections as Section[]).map((section) => ({
      id:
        section.type === "devotion-list"
          ? "devotion-challenge"
          : slugify(section.title),
      label: section.title,
    })),
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Head>
        <title>{data.name} – Master Guide Portfolio</title>
        <meta name="description" content="Master Guide portfolio" />
      </Head>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/40 dark:bg-gray-900/40 backdrop-blur-lg shadow-sm transition-all">
        <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between py-3">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "hero")}
            className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {data.name.split(" ")[0]}
          </a>

          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-12"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Dark Mode Toggle – with hydration-safe icon */}
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <section
          id="hero"
          className="text-center mb-16 animate-fade-in scroll-mt-24"
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/images/profile.jpg"
              alt={data.name}
              width={128}
              height={128}
              className="rounded-full border-4 border-blue-500 shadow-lg"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {data.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {data.tagline}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {data.about}
          </p>
          <blockquote className="italic mt-6 border-l-4 border-blue-500 pl-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {data.mission}
          </blockquote>
        </section>

        {/* Dedication */}
        {data.dedication && (
          <section
            id="dedication"
            className="mb-16 text-center animate-fade-in animation-delay-200 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-2">Dedication</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {data.dedication}
            </p>
          </section>
        )}

        {/* Sections – unchanged */}
        {(data.sections as Section[]).map((section, idx) => {
          const sectionId =
            section.type === "devotion-list"
              ? "devotion-challenge"
              : slugify(section.title);
          return (
            <section
              key={idx}
              id={sectionId}
              className="mb-16 animate-fade-in scroll-mt-24"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <h2 className="text-3xl font-bold border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-6 inline-block">
                {section.title}
              </h2>

              {isListSection(section) && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside">
                  {(section.items as string[]).map((item, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {isCardsSection(section) && (
                <div className="space-y-6">
                  {(section.items as PortfolioItem[]).map((item, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        {getTitle(item)}
                      </h3>

                      {hasDescription(item) && item.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {item.description}
                        </p>
                      )}

                      {hasLink(item) && (
                        <a
                          href={item.link}
                          className="inline-block mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          Learn more →
                        </a>
                      )}

                      {hasShareOptions(item) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.shareOptions.map((opt, j) => (
                            <a
                              key={j}
                              href={opt.url}
                              className="inline-block bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {opt.label}
                            </a>
                          ))}
                        </div>
                      )}

                      {hasEvents(item) && (
                        <div className="mt-4 space-y-3">
                          {item.events.map((event, k) => (
                            <div
                              key={k}
                              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                            >
                              <p className="font-medium">{event.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.date}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300">
                                {event.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {hasImages(item) && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                          {item.images.map((src, k) => (
                            <div
                              key={k}
                              className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden cursor-pointer group"
                              onClick={() => openImageModal(src)}
                            >
                              <Image
                                src={src}
                                alt={`${getTitle(item)} image ${k + 1}`}
                                fill
                                sizes="128px"
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isDevotionListSection(section) && (
                <div className="text-center mt-8">
                  <button
                    onClick={openListModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View All 30‑Day Devotions →
                  </button>
                </div>
              )}
            </section>
          );
        })}

        {/* Modals – unchanged */}
        {isDetailModalOpen && selectedDevotion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold dark:text-white">
                  {new Date(selectedDevotion.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-lg">📖 Bible Reading</h3>
                  <p>{selectedDevotion.bibleReading}</p>
                </div>
                {selectedDevotion.materialRead && (
                  <div>
                    <h3 className="font-semibold text-lg">📚 Material Read</h3>
                    <p>{selectedDevotion.materialRead}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">💭 Reflection</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedDevotion.reflection}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">✅ Application</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedDevotion.application}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">🙏 Prayer Focus</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedDevotion.prayerFocus}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">🎵 Song</h3>
                  <p>{selectedDevotion.song}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isListModalOpen && devotionSection && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeListModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold dark:text-white">
                  30‑Day Devotion Challenge
                </h2>
                <button
                  onClick={closeListModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4">
                {devotionSection.items.map((item, i) => {
                  const devotion = item as DevotionItem;
                  return (
                    <div
                      key={i}
                      className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        closeListModal();
                        openDetailModal(devotion);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold dark:text-white">
                            {new Date(devotion.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            📖 {devotion.bibleReading}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                            {devotion.reflection}
                          </p>
                        </div>
                        <span className="text-blue-500 text-sm">
                          Read more →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal for Images */}
        {isImageModalOpen && selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <div
              className="relative w-full h-full max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition z-10 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
                aria-label="Close image"
              >
                &times;
              </button>
              <Image
                src={selectedImage}
                alt="Full size"
                fill
                sizes="100vw"
                className="object-contain"
                priority={false}
              />
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
          © {new Date().getFullYear()} {data.name} – Master Guide Portfolio
        </footer>
      </main>
    </div>
  );
}
