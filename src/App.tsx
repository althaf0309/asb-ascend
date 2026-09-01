import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

// Toast surfaces and the tooltip provider pull in Radix and Sonner but render
// nothing until something fires. Loading them after first paint keeps them off
// the critical path - the hero text was waiting behind their evaluation.
const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);
const TooltipProvider = lazy(() =>
  import("@/components/ui/tooltip").then((m) => ({ default: m.TooltipProvider })),
);

// The landing page is the common entry point, so it ships in the main chunk.
import Index from "./pages/Index";

// Everything else loads on navigation. Most visitors never reach the admin
// console or the rich-text editor it pulls in, and they were previously paying
// for both on first paint.
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Gallery = lazy(() => import("./pages/Gallery"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const Apply = lazy(() => import("./pages/Apply"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Holds the header offset so a route swap does not collapse the layout. */
const RouteFallback = () => (
  <div className="min-h-screen pt-32 text-center text-muted-foreground" role="status" aria-live="polite">
    Loading…
  </div>
);

const queryClient = new QueryClient();

/**
 * Mounts its children only once the browser is idle after first paint, so
 * deferred UI never competes with the hero render.
 */
const AfterPaint = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  if (!ready) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:category" element={<Courses />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <Footer />
        <WhatsAppButton />

        <AfterPaint>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AfterPaint>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
