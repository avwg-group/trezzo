import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("products","routes/productsPage.tsx"),
    route("product/:slug","routes/productDetail.tsx"),
    route("checkout","routes/checkout.tsx"),
//   route("/faq", "pages/FaqPage.tsx"),
//   route("/contact", "pages/ContactPage.tsx"),
//   route("/refund-policy", "pages/RefundPolicyPage.tsx"),
//   route("/legal", "pages/LegalPage.tsx"),
//   route("/terms", "pages/TermsPage.tsx"),
//   route("/privacy", "pages/PrivacyPage.tsx"),
] satisfies RouteConfig;
