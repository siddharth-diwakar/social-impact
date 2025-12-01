export type LegalDocSection = {
  id: string;
  heading: string;
  excerpt: string;
};

export type LegalDocument = {
  id: string;
  title: string;
  description: string;
  type: string;
  sections: LegalDocSection[];
};

export const legalDocs: LegalDocument[] = [
  {
    id: "employment-handbook",
    title: "Employee Handbook – 2025 Update",
    description: "Signed version covering workplace policies and restrictive covenants.",
    type: "PDF",
    sections: [
      {
        id: "non-compete",
        heading: "Section 4.2 – Non-Compete Scope",
        excerpt:
          "Team members may not solicit floral clients within Travis County for 12 months post-termination. Update clause with precise ZIP codes.",
      },
      {
        id: "notice",
        heading: "Section 4.5 – Notice Requirements",
        excerpt:
          "Employees must receive a written offer of consideration 14 days before signing. Attach the digital receipt to their record.",
      },
    ],
  },
  {
    id: "marketing-guidelines",
    title: "Marketing Compliance Checklist",
    description: "Acceptable advertising claims for eco-packaging and subscriptions.",
    type: "Docx",
    sections: [
      {
        id: "auto-renewal",
        heading: "Clause 2.1 – Auto-Renewal Disclosure",
        excerpt:
          "Subscription landing pages must show renewal frequency and cancellation link above the CTA button.",
      },
      {
        id: "green-claims",
        heading: "Clause 3.4 – Green Marketing",
        excerpt:
          "Use “Compostable where facilities exist” and document the ASTM D6400 certification ID before publishing claims.",
      },
    ],
  },
  {
    id: "lease-agreement",
    title: "Retail Lease – Downtown Studio",
    description: "Key landlord covenants for signage, deliveries, and events.",
    type: "PDF",
    sections: [
      {
        id: "signage",
        heading: "Article VI – Signage",
        excerpt:
          "Exterior signage must be submitted to the City of Austin Design Commission prior to installation.",
      },
      {
        id: "events",
        heading: "Article VIII – Events",
        excerpt:
          "City permits for sidewalk pop-ups require 15-day notice. Attach permit number to the lease rider.",
      },
    ],
  },
];

