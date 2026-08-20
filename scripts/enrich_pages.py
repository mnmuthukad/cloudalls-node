import json

path = "data/content_pages.json"
d = json.load(open(path))

p = d["engineering"]
p["sections"] = [
    {
        "heading": "Global infrastructure status",
        "body": "CloudAlls platforms are delivered against a defined operational baseline: multi-region deployment targets, encrypted data in transit and at rest, and published availability objectives for contracted services. Infrastructure reviews are conducted quarterly, and incident summaries are recorded in the engineering log with corrective actions attached to each event.",
        "bullets": [
            "Multi-region deployment targets for client workloads",
            "Encrypted data in transit (TLS 1.3) and at rest (AES-256)",
            "Quarterly infrastructure reviews with recorded corrective actions",
        ],
    },
    {
        "heading": "Security core",
        "body": "Security is engineered, not bolted on. Every delivery inherits the CloudAlls baseline: least-privilege access, secrets management through a dedicated vault, dependency auditing on each build, and rate limiting with brute-force protection at every public surface. Penetration assessments are commissioned before major releases.",
        "bullets": [
            "Least-privilege IAM and vault-backed secrets management",
            "Dependency auditing and patching on every build pipeline run",
            "Rate limiting, brute-force protection, and Web Application Firewall rules on public surfaces",
            "Commissioned penetration assessments before major releases",
        ],
    },
    {
        "heading": "Continuous auditing",
        "body": "Trust is demonstrated through records, not claims. Audit trails, access logs, and configuration snapshots are retained against the schedules published in the legal center. Third-party compliance frameworks — including the standards referenced in our legal documents — are applied to client environments where contracted, and audit summaries are available to authorized parties on request.",
        "bullets": [
            "Retained audit trails, access logs, and configuration snapshots",
            "Compliance frameworks applied to contracted client environments",
            "Authorized-party audit summaries available on request",
        ],
    },
]

p = d["media"]
p["sections"] = [
    {
        "heading": "Responsible progress",
        "body": "We measure progress by the quality of the systems we create and the opportunities they open for people, teams, and communities — not by output volume. Every CloudAlls delivery is assessed against user impact, operational resilience, and long-term maintainability.",
    },
    {
        "heading": "Announcements",
        "body": "Company milestones, product releases, partnership news, and ecosystem updates are published here and through the CloudAlls insights library as they are verified and approved for public release. Announcements follow an editorial standard: technical claims are verified against production evidence before publication.",
    },
    {
        "heading": "Social impact",
        "body": "The CloudAlls Academy trains engineers from non-traditional backgrounds and feeds directly into hiring pipelines across the ecosystem, turning learning into employment rather than certificates alone. Community workshops and open reference architectures extend this reach beyond our own teams.",
    },
    {
        "heading": "Press and media",
        "body": "For media enquiries, interviews, and approved statements, contact the CloudAlls communications team through the contact channel with the subject line 'Media enquiry'. Spokesperson availability, approved facts, and image assets are provided within three business days of a verified request.",
    },
]

p = d["responsibility"]
p["sections"] = [
    {
        "heading": "Privacy and dignity",
        "body": "We treat personal data, consent, accessibility, and human context as first-class engineering requirements. Data minimization, explicit consent flows, retention limits, and deletion rights are enforced in the architecture, not just in policy. Details are published in the legal center under privacy and data-request policies.",
    },
    {
        "heading": "Inclusive access",
        "body": "Every CloudAlls product is built against WCAG accessibility targets with keyboard navigation, screen-reader compatibility, reduced-motion support, and readable contrast — validated during delivery, not added afterward. Systems should remain useful across devices, abilities, languages, and levels of technical confidence.",
    },
    {
        "heading": "Community learning",
        "body": "The CloudAlls Academy provides structured pathways in engineering, AI, and operations for learners from non-traditional backgrounds, with direct hiring pipelines across the ecosystem. Open reference architectures, documented tooling, and free community workshops extend that reach to the wider engineering community.",
    },
    {
        "heading": "Sustainable delivery",
        "body": "Delivery decisions carry environmental weight. We favor architectures that reduce computational waste — efficient data pipelines, cached assets, right-sized infrastructure — and we publish performance budgets that keep page weight, energy use, and user experience in balance.",
    },
]

json.dump(d, open(path, "w"), indent=2, ensure_ascii=False)
print("OK")
