import json

# ---------- PORTFOLIO: add 4 new case studies (existing: ids 2,3,4,5) ----------
new_portfolios = [
    {
        "id": 6,
        "title": "AI Voice Agent Suite for CareLink Health",
        "slug": "carelink-ai-voice-agent",
        "client_name": "CareLink Health Systems",
        "expertise_id": 3,
        "short_desc": "A multi-language AI voice agent that handles appointment scheduling, patient triage routing, and 24/7 enquiry automation across a 40-clinic network.",
        "full_content": "<p class=\"lead\">CareLink Health operated a 40-clinic network drowning in call volume. Every hour of missed calls meant lost appointments and strained front-desk teams. They needed an AI front office that answered in multiple languages, understood medical context, and never dropped a call.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">The Operational Challenge</h4>\r\n<p>The existing IVR system forced patients through rigid phone trees, and staff spent entire shifts repeating the same answers. A naïve chatbot would have failed — medical conversations require accurate routing, escalation triggers, and human handoff that is seamless rather than frustrating.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">Our Ecosystem Solution</h4>\r\n<p>CloudAlls Intelligence built a voice-agent architecture combining speech recognition, intent classification, and a retrieval layer trained on the clinic network's actual services and policies:</p>\r\n<ul>\r\n    <li>Appointments booked, rescheduled, or cancelled directly through conversation — synced to the clinic's existing practice-management calendar.</li>\r\n    <li>Smart triage routing that distinguishes routine enquiries from urgent symptoms and escalates to a human within seconds when needed.</li>\r\n    <li>Conversations conducted in English, Malayalam, Hindi, and Tamil with consistent service quality.</li>\r\n</ul>\r\n\r\n<h4 class=\"mt-5 mb-3\">Delivered Outcomes</h4>\r\n<ul>\r\n    <li>68% of inbound calls resolved without human intervention in the first quarter.</li>\r\n    <li>Appointment no-show rates reduced through automated reminder conversations.</li>\r\n    <li>Front-desk staff redeployed to in-clinic patient experience instead of phone duty.</li>\r\n</ul>\r\n\r\n<p>The deployment runs on CloudAlls infrastructure with end-to-end encryption of voice transcripts and strict health-data retention policies.</p>",
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop",
        "live_link": None,
        "status": "Published",
        "created_at": "2026-08-20 00:00:00",
    },
    {
        "id": 7,
        "title": "E-Commerce Replatform for Marav Stores",
        "slug": "marav-ecommerce-replatform",
        "client_name": "Marav Stores Group",
        "expertise_id": 1,
        "short_desc": "A headless e-commerce rebuild that migrated 18,000 SKUs to a faster storefront, lifting conversion 31% and cutting page weight in half.",
        "full_content": "<p class=\"lead\">Marav Stores' decade-old e-commerce platform was slow, fragile, and impossible to extend. Checkout abandonment was climbing, and every seasonal sale pushed the infrastructure past its limits. The business needed a platform engineered for growth, not just another redesign.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">The Architectural Challenge</h4>\r\n<p>Monolithic storefronts fail under sales pressure because presentation, cart, and payments are entangled in one application. Migrating 18,000 SKUs, customer accounts, and order history without a day of downtime was the core engineering constraint.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">Our Ecosystem Solution</h4>\r\n<p>CloudAlls Foundry delivered a headless architecture separating storefront, commerce engine, and checkout:</p>\r\n<ul>\r\n    <li>A Next.js storefront with incremental static regeneration — category pages render in milliseconds and stay fresh without full rebuilds.</li>\r\n    <li>Zero-downtime SKU and customer migration using dual-write validation and automated reconciliation scripts.</li>\r\n    <li>Isolated, PCI-scoped checkout service handling UPI, cards, and wallet payments with fraud screening.</li>\r\n</ul>\r\n\r\n<h4 class=\"mt-5 mb-3\">Delivered Outcomes</h4>\r\n<ul>\r\n    <li>Page weight reduced by 52%; Core Web Vitals moved from 'poor' to 'good' across all device classes.</li>\r\n    <li>Conversion rate up 31% in the first two quarters after relaunch.</li>\r\n    <li>Seasonal sale traffic peaks handled without any infrastructure intervention.</li>\r\n</ul>\r\n\r\n<p>Operations now run on CloudAlls infrastructure with automated backups, staged deployments, and a 24/7 monitoring dashboard shared with the client.</p>",
        "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop",
        "live_link": None,
        "status": "Published",
        "created_at": "2026-08-20 00:00:00",
    },
    {
        "id": 8,
        "title": "Smart Campus Operations for Al Noor Education",
        "slug": "al-noor-smart-campus",
        "client_name": "Al Noor Education Group",
        "expertise_id": 10,
        "short_desc": "A unified IoT and access-control deployment across three campuses: attendance, facility energy, CCTV analytics, and visitor management on one platform.",
        "full_content": "<p class=\"lead\">Al Noor Education Group ran three campuses on disconnected systems — separate attendance registers, CCTV vendors, energy meters, and visitor books. Nothing talked to anything else, and safety incidents took too long to surface. They needed one operational layer over all of it.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">The Operational Challenge</h4>\r\n<p>Educational facilities juggle thousands of daily movements — students, staff, visitors, buses — and every subsystem historically lived in its own silo. Retrofitting intelligence onto existing hardware without replacing working equipment was essential to keep the budget realistic.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">Our Ecosystem Solution</h4>\r\n<p>CloudAlls Infrastructure and Operations converged the estates onto a single telemetry platform:</p>\r\n<ul>\r\n    <li>Biometric and card attendance unified with timetable data — late arrivals, absences, and bus dispatch alerts in one feed.</li>\r\n    <li>Existing CCTV retained; video analytics added at the edge for crowd-density and restricted-zone alerts.</li>\r\n    <li>Energy metering on AC, lighting, and pumps with automated off-peak scheduling that cut facility costs.</li>\r\n    <li>Visitor management with pre-registration, photo verification, and host notifications at gate level.</li>\r\n</ul>\r\n\r\n<h4 class=\"mt-5 mb-3\">Delivered Outcomes</h4>\r\n<ul>\r\n    <li>Facility energy costs down 23% in the first year through automated scheduling.</li>\r\n    <li>Incident response time reduced from minutes to seconds via automated alerts to campus safety teams.</li>\r\n    <li>Parents receive automated daily arrival and departure confirmations.</li>\r\n</ul>\r\n\r\n<p>The platform runs on CloudAlls-managed infrastructure with role-based access per campus and encrypted audit trails.</p>",
        "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop",
        "live_link": None,
        "status": "Published",
        "created_at": "2026-08-20 00:00:00",
    },
    {
        "id": 9,
        "title": "Brand System Launch for Tidal Resorts",
        "slug": "tidal-resorts-brand-system",
        "client_name": "Tidal Resorts & Hospitality",
        "expertise_id": 4,
        "short_desc": "A complete brand identity and digital experience for a coastal hospitality group — wordmark, guidelines, booking-grade website, and campaign assets.",
        "full_content": "<p class=\"lead\">Tidal Resorts was opening its second property with an identity built on templates: borrowed typography, inconsistent colours, and a booking website that looked nothing like its lobby. CloudAlls Studio rebuilt the brand from first principles and shipped a digital experience worthy of the property itself.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">The Creative Challenge</h4>\r\n<p>Hospitality brands live and die on the first impression. The identity needed to work across a wayfinding-grade wordmark, a photography-led website with live availability, and OTA-style campaign assets — all from one coherent system.</p>\r\n\r\n<h4 class=\"mt-5 mb-3\">Our Ecosystem Solution</h4>\r\n<p>CloudAlls Studio delivered the full brand system:</p>\r\n<ul>\r\n    <li>Original wordmark, logotype lockups, and a colour system drawn from the coastline context, documented in a full guidelines kit.</li>\r\n    <li>A booking-grade website with real-time room availability, direct booking, and photography-driven storytelling.</li>\r\n    <li>Menu of campaign assets: launch film, OTA imagery, social templates, and printed collateral for on-property use.</li>\r\n</ul>\r\n\r\n<h4 class=\"mt-5 mb-3\">Delivered Outcomes</h4>\r\n<ul>\r\n    <li>Direct bookings up 44% versus the previous template site within six months.</li>\r\n    <li>Brand guidelines adopted across both properties with zero design inconsistencies.</li>\r\n    <li>Launch campaign achieved full occupancy across the opening quarter.</li>\r\n</ul>\r\n\r\n<p>Every asset is produced in-house by the CloudAlls Studio and stored in the brand portal for the client's team.</p>",
        "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
        "live_link": None,
        "status": "Published",
        "created_at": "2026-08-20 00:00:00",
    },
]

p_path = "data/portfolio.json"
existing = json.load(open(p_path))
existing.extend(new_portfolios)
json.dump(existing, open(p_path, "w"), indent=2, ensure_ascii=False)

# ---------- INSIGHTS: add 4 new articles (existing: ids 1,2,3) ----------
new_insights = [
    {
        "id": 4,
        "title": "Headless Commerce: Why the Storefront Is No Longer the Business",
        "slug": "headless-commerce-strategy-2026",
        "expertise_id": 1,
        "excerpt": "The storefront used to BE the business. In 2026 it is one channel among many — and the businesses winning treat the commerce engine, not the website, as the centre of gravity.",
        "content": "<p>The headless conversation has matured past its hype cycle. What began as a way to make websites faster has become the default architecture for any commerce operation that sells beyond a browser — marketplaces, mobile apps, voice ordering, WhatsApp storefronts, and in-store kiosks all now consume the same commerce engine.</p>\r\n<p>The shift is conceptual: <strong>the storefront is a channel; the business logic is the asset.</strong> Organisations that still treat their website as the product rebuild it entirely whenever a channel changes. Organisations that treat the commerce engine as the product plug channels in and out with weeks of effort instead of years.</p>\r\n<h4>What actually moves when you go headless</h4>\r\n<ul>\r\n<li><strong>Presentation decouples from logic.</strong> Catalogue, cart, pricing, and payments live behind an API surface. Every channel consumes the same source of truth.</li>\r\n<li><strong>Teams ship in parallel.</strong> The storefront team deploys weekly without touching checkout; the checkout team evolves payments without blocking marketing.</li>\r\n<li><strong>Performance becomes an engineering fact.</strong> Static and incrementally-generated pages deliver sub-second category experiences that monolithic platforms cannot match under load.</li>\r\n</ul>\r\n<h4>When headless is not worth it</h4>\r\n<p>Honesty matters here: a single-channel catalog business with modest traffic rarely needs this. Headless pays for itself when channels multiply, when team size justifies parallel work, or when seasonal scale exposes monolithic limits. The decision is about operational geometry, not technology fashion.</p>\r\n<p>At CloudAlls, every commerce rebuild since 2025 has shipped headless by default — because the channel landscape will not stop expanding, and the architecture should not have to be rebuilt to follow it.</p>",
        "meta_title": "Headless Commerce in 2026: Storefront as Channel, Engine as Business | CloudAlls",
        "meta_description": "Why leading commerce teams treat the commerce engine — not the website — as the centre of gravity, and how headless architecture follows the channel landscape.",
        "meta_keywords": "headless commerce, e-commerce architecture, storefront strategy, CloudAlls insights",
        "image_url": "https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=1000&auto=format&fit=crop",
        "status": "Published",
        "created_at": "2026-08-19 00:00:00",
    },
    {
        "id": 5,
        "title": "The Quiet Cost of Technical Debt in AI Systems",
        "slug": "technical-debt-ai-systems",
        "expertise_id": 3,
        "excerpt": "AI features ship fast and rot quietly. The cost of skipping evaluation suites, versioned prompts, and observability is paid exactly when the system matters most.",
        "content": "<p>Every AI system we audit follows the same pattern: an impressive prototype, a rushed production rollout, and a slow accumulation of quiet failures — hallucinated answers that nobody noticed, prompt changes that degraded quality without anyone measuring, and costs that drifted upward as token usage quietly compounded.</p>\r\n<p>The uncomfortable truth: <strong>AI technical debt is invisible by design.</strong> Unlike a slow database query, a degraded AI answer often looks correct. The failure mode is not an error log — it is eroded trust.</p>\r\n<h4>The three debts that kill AI projects</h4>\r\n<ul>\r\n<li><strong>Evaluation debt.</strong> Systems without automated eval suites regress silently. Every prompt change becomes a coin flip. Building a representative eval set before launch is the single highest-ROI activity in any AI project.</li>\r\n<li><strong>Prompt and model debt.</strong> Prompts edited inline, models swapped ad hoc, and parameters tuned in production without records turn an AI system into an unrepeatable artifact. Versioning is not bureaucracy — it is recoverability.</li>\r\n<li><strong>Observability debt.</strong> Token costs, latency distributions, and answer-quality signals need dashboards from day one, not after the invoice surprises you.</li>\r\n</ul>\r\n<h4>The engineering answer</h4>\r\n<p>Treat AI components like any other production system: versioned artifacts, CI-gated evaluation, cost alerts, and human-review sampling. The teams that ship AI sustainably are not the ones with better models — they are the ones with better discipline.</p>\r\n<p>This is the practice embedded in every CloudAlls Intelligence delivery: an AI system is only as trustworthy as its measurement.</p>",
        "meta_title": "Technical Debt in AI Systems: The Quiet Cost | CloudAlls Insights",
        "meta_description": "Why AI systems fail quietly — evaluation debt, prompt drift, and missing observability — and the engineering discipline that keeps them trustworthy.",
        "meta_keywords": "AI technical debt, LLM evaluation, AI observability, enterprise AI",
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        "status": "Published",
        "created_at": "2026-08-18 00:00:00",
    },
    {
        "id": 6,
        "title": "Zero-Downtime Migrations: The Discipline Nobody Markets",
        "slug": "zero-downtime-migration-discipline",
        "expertise_id": 10,
        "excerpt": "Migrations are not projects; they are campaigns. The difference between a launch that works and a launch that scrambles is written months before go-live.",
        "content": "<p>Every infrastructure team celebrates migrations that “just worked.” Almost none of them acknowledge how much of that outcome was engineered in advance. A zero-downtime migration is not a technical trick — it is a months-long campaign of dual runs, reconciliation, and staged cutover.</p>\r\n<h4>The discipline in practice</h4>\r\n<ul>\r\n<li><strong>Dual-write validation.</strong> Both old and new systems process real traffic in parallel. Reconciliation scripts compare outcomes continuously until the delta is effectively zero.</li>\r\n<li><strong>Staged cutover.</strong> Traffic moves segment by segment — internal users, low-risk cohorts, then the remainder — with automated rollback at every stage.</li>\r\n<li><strong>Reversibility as a requirement.</strong> If any stage cannot be reversed in minutes, the stage does not proceed. Comfortable rollback is what makes teams brave enough to move fast.</li>\r\n</ul>\r\n<h4>Why this matters commercially</h4>\r\n<p>Downtime is not an embarrassment — it is revenue, reputation, and sometimes safety. For a commerce platform, an hour of outage during peak is five figures. For a healthcare or education system, the stakes are worse. The discipline costs more upfront and pays back in the single digit of incidents.</p>\r\n<p>CloudAlls runs every production migration under this campaign model, with a written rollback plan for every stage. The boring part is the professional part.</p>",
        "meta_title": "Zero-Downtime Migrations: Campaign-Grade Discipline | CloudAlls Insights",
        "meta_description": "How production migrations are actually executed: dual-write validation, staged cutover, and enforced reversibility — the discipline that makes them boring in the best way.",
        "meta_keywords": "zero downtime migration, infrastructure cutover, CloudAlls operations",
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
        "status": "Published",
        "created_at": "2026-08-17 00:00:00",
    },
    {
        "id": 7,
        "title": "Design Systems for Companies That Outgrow Their First 100 Screens",
        "slug": "design-systems-scale-beyond-screens",
        "expertise_id": 4,
        "excerpt": "Your first hundred screens were designed. The next thousand need to be engineered. The pivot from pixel craft to design-system infrastructure is a company-building decision.",
        "content": "<p>There is a moment in every product company's life when the design team stops being the bottleneck and starts being the casualty: features duplicate each other, components drift across platforms, and “similar” buttons become seventeen different buttons.</p>\r\n<p>Scaling design is not hiring more designers. It is <strong>converting design into infrastructure</strong> — components, tokens, and rules that product teams consume rather than recreate.</p>\r\n<h4>The three layers of a real design system</h4>\r\n<ul>\r\n<li><strong>Tokens.</strong> Colour, spacing, type, and motion defined once as code. A token change propagates everywhere; a hex value hunt does not.</li>\r\n<li><strong>Components.</strong> Buttons, forms, cards, and charts shipped as versioned packages with usage documentation and accessible defaults — consumed by web, mobile, and desktop teams from the same source.</li>\r\n<li><strong>Patterns.</strong> The documented “how we solve this problem” library: empty states, error recovery, onboarding flows. Patterns encode judgment, which is the thing most systems lose first.</li>\r\n</ul>\r\n<h4>What actually changes</h4>\r\n<p>Feature velocity goes up because teams stop designing fundamentals. Consistency becomes automatic because deviation requires effort. And designers graduate from pixel craft to solving problems the components do not yet cover — which is where their value actually lives.</p>\r\n<p>CloudAlls Studio builds design systems as products: versioned, documented, and adopted through engineering workflows rather than by goodwill.</p>",
        "meta_title": "Design Systems at Scale: From Screens to Infrastructure | CloudAlls Insights",
        "meta_description": "How product companies pivot from pixel craft to design-system infrastructure — tokens, components, and patterns that make consistency automatic.",
        "meta_keywords": "design systems, component libraries, design tokens, CloudAlls Studio",
        "image_url": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1000&auto=format&fit=crop",
        "status": "Published",
        "created_at": "2026-08-16 00:00:00",
    },
]

i_path = "data/insights.json"
existing_i = json.load(open(i_path))
existing_i.extend(new_insights)
json.dump(existing_i, open(i_path, "w"), indent=2, ensure_ascii=False)
print("OK: portfolios now", len(existing), "| insights now", len(existing_i))
