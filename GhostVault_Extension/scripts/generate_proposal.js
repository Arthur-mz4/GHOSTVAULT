/*
 GhostVault Proposal Generator
 Usage:
   1) Install dependency: npm i docx
   2) Run: node scripts/generate_proposal.js
 Output: GhostVault_Project_Proposal.docx in the project root
*/

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation, UnderlineType, BulletList, Numbering, LevelFormat } = require('docx');
const fs = require('fs');
const path = require('path');

// You can customize these before running
const meta = {
  title: 'GhostVault – Cybersecurity & Privacy Toolkit',
  studentNames: 'Student Name(s): [Your Name Here]',
  course: 'Course: [Your Course Name]',
  year: 'Year: 3rd Year',
  date: 'Date: 2025-08-21', // provided by system; adjust if needed
};

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { after: 200 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri' })],
    spacing: { after: 120 },
  });
}

function bullet(items) {
  return items.map((t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } }));
}

function coverPage() {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: meta.title, bold: true, size: 48 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({ text: meta.studentNames, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ text: meta.course, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ text: meta.year, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    new Paragraph({ text: meta.date, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: '', pageBreakBefore: true }),
  ];
}

function sectionIntroduction() {
  return [
    heading('1. Cover Page'),
    body('See cover details on the first page.'),
    heading('2. Introduction / Purpose of the Project'),
    body('GhostVault addresses the growing need to protect users\' online privacy and device security. Everyday users are exposed to trackers, risky third-party cookies, phishing websites, and insecure applications. Meanwhile, large-scale data breaches continue to leak personal information.'),
    body('The purpose of GhostVault is to provide a combined browser extension and mobile application that informs, protects, and empowers users. The extension focuses on web privacy (e.g., tracker blocking, cookie risk mitigation, T&C analysis), while the mobile app focuses on device privacy and security (e.g., app permission awareness, storage and network checks).'),
  ];
}

function sectionObjectives() {
  return [
    heading('3. Project Objectives'),
    ...bullet([
      'Block or warn about trackers and potentially risky cookies during browsing.',
      'Analyze Terms & Conditions text to highlight risky clauses and legal red flags.',
      'Check for known data breaches related to user accounts and provide guidance.',
      'Scan and guide users regarding app permissions (awareness and best practices).',
      'Assess storage and network privacy risks on the device.',
      'Provide a consolidated Privacy Health Score to summarize user privacy posture.',
      'Offer practical privacy tips and recommendations.',
    ]),
  ];
}

function sectionDesign() {
  const diagram = [
    '+--------------------+           +------------------------+',
    '|  Browser Extension |           |      Mobile App        |',
    '|  (Web Protection)  |           |  (Device Protection)   |',
    '+----------+---------+           +-----------+------------+',
    '           |                                 |',
    '           v                                 v',
    '   Tracker/Cookie Blocking           App Permission Guidance',
    '   T&C Analyzer                      Storage & Network Checks',
    '   Breach Checker (via proxy/API)    Privacy Tips',
    '                                      Privacy Health Score',
  ].join('\n');

  return [
    heading('4. System Design & Architecture'),
    body('GhostVault consists of two coordinated components:'),
    ...bullet([
      'Browser Extension: Focused on real-time web privacy features such as tracker warnings, risky cookie handling, and T&C analysis directly within the browser context.',
      'Mobile App (React Native + Expo): Focused on device-centric features including app permission awareness, storage privacy checks, Wi‑Fi/network checks, breach alerts, and the overall Privacy Health Score.',
    ]),
    body('Key Differences between Platforms:'),
    ...bullet([
      'Context: The extension operates within the browser and can inspect or modify web requests; the mobile app runs on the device and uses operating system capabilities provided by Expo modules.',
      'Permissions: The extension relies on browser permissions (e.g., webRequest, storage). The mobile app uses platform permissions exposed via Expo (e.g., SecureStore, Network).',
      'UX: The extension provides inline alerts and a popup dashboard; the mobile app offers a full-screen, touch UI with navigation between privacy tools.',
    ]),
    heading('Simple Architecture Diagram'),
    new Paragraph({ children: [ new TextRun({ text: diagram, font: 'Consolas' }) ] }),
  ];
}

function sectionTech() {
  return [
    heading('5. Implementation Languages & Frameworks'),
    body('Browser Extension:'),
    ...bullet([
      'Languages: JavaScript, HTML, CSS.',
      'Approach: Uses open-source lists and logic for tracker/cookie classification where applicable.',
    ]),
    body('Mobile App:'),
    ...bullet([
      'Framework: React Native with Expo (JavaScript/TypeScript) for cross‑platform iOS/Android.',
      'UI: React Native Paper for consistent, accessible components and theming.',
      'Navigation: React Navigation (native-stack).',
      'Secure Storage: Expo SecureStore for encrypted on-device credential storage.',
      'Additional Modules: Expo DocumentPicker, FileSystem, Network, and others as needed.',
    ]),
  ];
}

function sectionSDLC() {
  return [
    heading('6. Software Development Life Cycle (SDLC) Model'),
    body('Chosen Model: Agile (Iterative).'),
    ...bullet([
      'Justification: Privacy/security needs evolve quickly; Agile supports frequent updates.',
      'User Feedback: Iterations allow usability testing of both the extension and mobile app.',
      'Incremental Features: Complex features (e.g., permission scanning guidance) are added in sprints.',
      'Quality: Continuous integration and testing reduce regressions and improve reliability.',
    ]),
  ];
}

function sectionOutcomes() {
  return [
    heading('7. Expected Outcomes & Benefits'),
    ...bullet([
      'Safer browsing via tracker/cookie awareness and warnings.',
      'Protection from risky apps and insecure networks on mobile devices.',
      'Continuous breach checking with clear guidance on next steps.',
      'A unique Privacy Health Score to raise awareness and promote better habits.',
    ]),
  ];
}

function sectionConclusion() {
  return [
    heading('8. Conclusion'),
    body('GhostVault responds to modern privacy and security challenges by combining a proactive browser extension with a practical mobile companion app. Together, they empower users with knowledge, visibility, and tools to reduce risks.'),
    body('By delivering clear insights—such as risky clauses in T&Cs, network/storage warnings, and breach alerts—GhostVault helps users take control of their digital footprint while learning good privacy practices.'),
    heading('References'),
    ...bullet([
      '[1] OWASP Foundation. OWASP Top Ten and Mobile Security Testing Guide.',
      '[2] Electronic Frontier Foundation (EFF): Privacy Badger and related resources.',
      '[3] Have I Been Pwned (HIBP) API documentation.',
      '[4] Expo and React Native official documentation.',
      '[5] Academic and industry articles on web tracking, cookies, and privacy UX.',
    ]),
  ];
}

function buildDoc() {
  const doc = new Document({
    creator: 'GhostVault Team',
    description: 'GhostVault – Cybersecurity & Privacy Toolkit: Project Proposal',
    title: 'GhostVault Project Proposal',
    sections: [
      { children: coverPage() },
      { children: [
          ...sectionIntroduction(),
          ...sectionObjectives(),
          ...sectionDesign(),
          ...sectionTech(),
          ...sectionSDLC(),
          ...sectionOutcomes(),
          ...sectionConclusion(),
        ]
      }
    ],
  });
  return doc;
}

async function main() {
  const doc = buildDoc();
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve(process.cwd(), 'GhostVault_Project_Proposal.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated:', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
