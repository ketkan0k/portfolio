// create_bilingual.js
// Creates Portfolio_Content_Bilingual.docx using docx-js
// UTF-8 encoded — Thai text is embedded directly

"use strict";

const fs = require("fs");
const path = require("path");

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageBreak,
} = require("docx");

// ─── Design constants ────────────────────────────────────────────────────────
const FONT = "Calibri";

// A4 page: 11906 DXA wide, 1 cm margins = 567 DXA each side
// Content width = 11906 - 567 - 567 = 10772 DXA
const PAGE_WIDTH = 11906;
const MARGIN = 567;
const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2; // 10772

// Column widths: Label=1616 (15%), EN=4578 (42.5%), TH=4578 (42.5%) → 10772
const COL_LABEL = 1616;
const COL_EN = 4578;
const COL_TH = 4578;

const CLR_HEADING = "1A2744";
const CLR_ACCENT = "C4A96B";
const CLR_SUBTITLE = "8A8A8A";
const CLR_BODY = "2C2C2C";
const CLR_LABEL_TEXT = "8A8A8A";
const CLR_BORDER = "CCCCCC";
const CLR_WHITE = "FFFFFF";
const CLR_ROW_ODD = "FFFFFF";
const CLR_ROW_EVEN = "F9F6F0";
const CLR_HEADER_FILL = "1A2744";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: CLR_BORDER };
const allBorders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

// ─── Helper: title paragraph ─────────────────────────────────────────────────
function makeTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 40, // 20pt = 40 half-points
        bold: true,
        color: CLR_HEADING,
      }),
    ],
  });
}

// ─── Helper: subtitle paragraph ──────────────────────────────────────────────
function makeSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 20, // 10pt
        italics: true,
        color: CLR_SUBTITLE,
      }),
    ],
  });
}

// ─── Helper: spacer paragraph ────────────────────────────────────────────────
function spacer() {
  return new Paragraph({ children: [new TextRun("")] });
}

// ─── Helper: H1 section heading ──────────────────────────────────────────────
function makeH1(text) {
  return new Paragraph({
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 26, // 13pt
        bold: true,
        color: CLR_HEADING,
      }),
    ],
  });
}

// ─── Helper: H2 sub-section heading ──────────────────────────────────────────
function makeH2(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 20, // 10pt
        bold: true,
        color: CLR_ACCENT,
      }),
    ],
  });
}

// ─── Helper: page break paragraph ────────────────────────────────────────────
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Helper: make table cell ──────────────────────────────────────────────────
function makeHeaderCell(text, width) {
  return new TableCell({
    borders: allBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: CLR_HEADER_FILL, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 18, // 9pt
            bold: true,
            color: CLR_WHITE,
          }),
        ],
      }),
    ],
  });
}

function makeLabelCell(text, fill) {
  return new TableCell({
    borders: allBorders,
    width: { size: COL_LABEL, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 16, // 8pt
            italics: true,
            color: CLR_LABEL_TEXT,
          }),
        ],
      }),
    ],
  });
}

function makeContentCell(text, fill, width) {
  return new TableCell({
    borders: allBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 18, // 9pt
            color: CLR_BODY,
          }),
        ],
      }),
    ],
  });
}

// ─── Helper: build 3-column table ─────────────────────────────────────────────
// rows: array of [label, en, th]
function makeTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      makeHeaderCell("Label", COL_LABEL),
      makeHeaderCell("EN", COL_EN),
      makeHeaderCell("TH", COL_TH),
    ],
  });

  const dataRows = rows.map(([label, en, th], idx) => {
    const fill = idx % 2 === 0 ? CLR_ROW_ODD : CLR_ROW_EVEN;
    return new TableRow({
      children: [
        makeLabelCell(label, fill),
        makeContentCell(en, fill, COL_EN),
        makeContentCell(th, fill, COL_TH),
      ],
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_LABEL, COL_EN, COL_TH],
    rows: [headerRow, ...dataRows],
  });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Portfolio Website Content \u2014 Ketkanok Jongcham",
            font: FONT,
            size: 16, // 8pt
            color: CLR_SUBTITLE,
          }),
        ],
      }),
    ],
  });
}

// ─── Section properties shared ────────────────────────────────────────────────
const pageProps = {
  page: {
    size: { width: 11906, height: 16838 }, // A4
    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
  },
};

// ─── Build document ───────────────────────────────────────────────────────────
const children = [];

// === TITLE PAGE ===
children.push(makeTitle("Portfolio Website \u2014 Bilingual Content List"));
children.push(
  makeSubtitle(
    "\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e41\u0e25\u0e30\u0e41\u0e01\u0e49\u0e44\u0e02\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21 | For Review & Editing"
  )
);
children.push(spacer());

// === PAGE 1: HOME ===
children.push(pageBreak());
children.push(makeH1("Page 1 \u2014 HOME (\u0e2b\u0e19\u0e49\u0e32\u0e2b\u0e25\u0e31\u0e01)"));
children.push(
  makeTable([
    [
      "Eyebrow",
      "Portfolio \u2014 Product & Technology",
      "\u0e1e\u0e2d\u0e23\u0e4c\u0e15\u0e42\u0e1f\u0e25\u0e34\u0e42\u0e2d \u2014 \u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e41\u0e25\u0e30\u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35",
    ],
    [
      "Heading",
      "Turning Vision Into Digital Reality",
      "\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e27\u0e34\u0e2a\u0e31\u0e22\u0e17\u0e31\u0e28\u0e19\u0e4c \u0e2a\u0e39\u0e48\u0e04\u0e27\u0e32\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e08\u0e23\u0e34\u0e07 \u0e17\u0e32\u0e07\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25",
    ],
    [
      "Sub-text",
      "5+ years crafting enterprise digital products \u2014 from concept to go-live \u2014 with precision, care, and a relentless pursuit of quality.",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e01\u0e32\u0e23\u0e13\u0e4c\u0e01\u0e27\u0e48\u0e32 5 \u0e1b\u0e35\u0e43\u0e19\u0e01\u0e32\u0e23\u0e02\u0e31\u0e1a\u0e40\u0e04\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23 \u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e41\u0e19\u0e27\u0e04\u0e34\u0e14\u0e08\u0e19\u0e16\u0e36\u0e07 Go-Live \u0e14\u0e49\u0e27\u0e22\u0e04\u0e27\u0e32\u0e21\u0e41\u0e21\u0e48\u0e19\u0e22\u0e33 \u0e43\u0e2a\u0e48\u0e43\u0e08 \u0e41\u0e25\u0e30\u0e21\u0e38\u0e48\u0e07\u0e21\u0e31\u0e48\u0e19\u0e43\u0e19\u0e04\u0e38\u0e13\u0e20\u0e32\u0e1e",
    ],
    ["Stat 1", "Years Experience", "\u0e1b\u0e35\u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e01\u0e32\u0e23\u0e13\u0e4c"],
    [
      "Stat 2",
      "Products Owned",
      "\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e17\u0e35\u0e48\u0e14\u0e39\u0e41\u0e25",
    ],
    [
      "Stat 3",
      "Stakeholders Led",
      "\u0e1c\u0e39\u0e49\u0e21\u0e35\u0e2a\u0e48\u0e27\u0e19\u0e44\u0e14\u0e49\u0e2a\u0e48\u0e27\u0e19\u0e40\u0e2a\u0e35\u0e22",
    ],
    [
      "CTA Button",
      "Let's Connect \u2192",
      "\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e09\u0e31\u0e19 \u2192",
    ],
  ])
);

// === PAGE 2: ABOUT ===
children.push(pageBreak());
children.push(
  makeH1(
    "Page 2 \u2014 ABOUT (\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a)"
  )
);
children.push(
  makeTable([
    [
      "Eyebrow",
      "Who I Am",
      "\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e09\u0e31\u0e19",
    ],
    [
      "Heading",
      "The Story Behind the Work",
      "\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e23\u0e32\u0e27 \u0e40\u0e1a\u0e37\u0e49\u0e2d\u0e07\u0e2b\u0e25\u0e31\u0e07\u0e1c\u0e25\u0e07\u0e32\u0e19",
    ],
    [
      "Paragraph 1",
      "I'm a Product Owner and Project Manager with over 5 years of experience leading end-to-end digital product development in the real estate industry at Noble Development PCL \u2014 one of Thailand's leading property developers.",
      "\u0e09\u0e31\u0e19\u0e40\u0e1b\u0e47\u0e19 Product Owner \u0e41\u0e25\u0e30 Project Manager \u0e17\u0e35\u0e48\u0e21\u0e35\u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e01\u0e32\u0e23\u0e13\u0e4c\u0e01\u0e27\u0e48\u0e32 5 \u0e1b\u0e35\u0e43\u0e19\u0e01\u0e32\u0e23\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25\u0e43\u0e19\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08\u0e2d\u0e2a\u0e31\u0e07\u0e2b\u0e32\u0e23\u0e34\u0e21\u0e17\u0e23\u0e31\u0e1e\u0e22\u0e4c\u0e17\u0e35\u0e48 Noble Development PCL \u2014 \u0e2b\u0e19\u0e36\u0e48\u0e07\u0e43\u0e19\u0e1c\u0e39\u0e49\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e2d\u0e2a\u0e31\u0e07\u0e2b\u0e32\u0e23\u0e34\u0e21\u0e17\u0e23\u0e31\u0e1e\u0e22\u0e4c\u0e0a\u0e31\u0e49\u0e19\u0e19\u0e33\u0e02\u0e2d\u0e07\u0e44\u0e17\u0e22",
    ],
    [
      "Paragraph 2",
      "My work spans the full product lifecycle: translating C-Level business direction into structured development plans, hands-on UX/UI review in Figma, QA oversight, UAT coordination, user training, and post-launch support.",
      "\u0e07\u0e32\u0e19\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19\u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21\u0e27\u0e07\u0e08\u0e23\u0e0a\u0e35\u0e27\u0e34\u0e15\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14 \u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e01\u0e32\u0e23\u0e41\u0e1b\u0e25\u0e07\u0e17\u0e34\u0e28\u0e17\u0e32\u0e07\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08\u0e08\u0e32\u0e01 C-Level \u0e40\u0e1b\u0e47\u0e19\u0e41\u0e1c\u0e19\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e17\u0e35\u0e48\u0e0a\u0e31\u0e14\u0e40\u0e08\u0e19 \u0e01\u0e32\u0e23\u0e23\u0e35\u0e27\u0e34\u0e27 UX/UI \u0e43\u0e19 Figma \u0e01\u0e32\u0e23\u0e04\u0e27\u0e1a\u0e04\u0e38\u0e21\u0e04\u0e38\u0e13\u0e20\u0e32\u0e1e UAT \u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21 \u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e2b\u0e25\u0e31\u0e07 Go-Live",
    ],
    [
      "Paragraph 3",
      "I currently own and manage 8+ digital platforms \u2014 POS (CRM, Booking, Contract, Transfer) and Non-POS (Noble ID, Website, CMS, CDP, Payment) \u2014 serving as the company's sole Product Owner for its entire digital ecosystem.",
      "\u0e1b\u0e31\u0e08\u0e08\u0e38\u0e1a\u0e31\u0e19\u0e14\u0e39\u0e41\u0e25\u0e41\u0e25\u0e30\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25 8+ \u0e23\u0e30\u0e1a\u0e1a \u0e17\u0e31\u0e49\u0e07 POS (CRM, Booking, Contract, Transfer) \u0e41\u0e25\u0e30 Non-POS (Noble ID, Website, CMS, CDP, Payment) \u0e43\u0e19\u0e10\u0e32\u0e19\u0e30 Product Owner \u0e40\u0e1e\u0e35\u0e22\u0e07\u0e04\u0e19\u0e40\u0e14\u0e35\u0e22\u0e27\u0e02\u0e2d\u0e07\u0e23\u0e30\u0e1a\u0e1a\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17",
    ],
    [
      "Paragraph 4",
      "Before stepping into product roles, I spent 3 years in Japan as a Manufacturing Operations Coordinator at OMRON Corporation \u2014 an experience that sharpened my precision, process discipline, and cross-cultural communication.",
      "\u0e01\u0e48\u0e2d\u0e19\u0e01\u0e49\u0e32\u0e27\u0e2a\u0e39\u0e48\u0e1a\u0e17\u0e1a\u0e32\u0e17\u0e14\u0e49\u0e32\u0e19\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c \u0e09\u0e31\u0e19\u0e43\u0e0a\u0e49\u0e40\u0e27\u0e25\u0e32 3 \u0e1b\u0e35\u0e43\u0e19\u0e0d\u0e35\u0e48\u0e1b\u0e38\u0e48\u0e19\u0e17\u0e35\u0e48 OMRON Corporation \u2014 \u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e01\u0e32\u0e23\u0e13\u0e4c\u0e19\u0e31\u0e49\u0e19\u0e2b\u0e25\u0e48\u0e2d\u0e2b\u0e25\u0e2d\u0e21\u0e04\u0e27\u0e32\u0e21\u0e41\u0e21\u0e48\u0e19\u0e22\u0e33 \u0e27\u0e34\u0e19\u0e31\u0e22\u0e43\u0e19\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e17\u0e31\u0e01\u0e29\u0e30\u0e01\u0e32\u0e23\u0e2a\u0e37\u0e48\u0e2d\u0e2a\u0e32\u0e23\u0e02\u0e49\u0e32\u0e21\u0e27\u0e31\u0e12\u0e19\u0e18\u0e23\u0e23\u0e21",
    ],
    [
      "Meta - Current Role",
      "Experience & Platform Manager / PO",
      "Experience & Platform Manager / PO",
    ],
    [
      "Meta - Languages",
      "Thai \u00b7 English \u00b7 Japanese",
      "\u0e44\u0e17\u0e22 \u00b7 \u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29 \u00b7 \u0e0d\u0e35\u0e48\u0e1b\u0e38\u0e48\u0e19",
    ],
    [
      "Meta - Location",
      "Bangkok, Thailand",
      "\u0e01\u0e23\u0e38\u0e07\u0e40\u0e17\u0e1e\u0e2f \u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28\u0e44\u0e17\u0e22",
    ],
  ])
);

// === PAGE 3: EXPERIENCE ===
children.push(pageBreak());
children.push(
  makeH1(
    "Page 3 \u2014 EXPERIENCE (\u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e01\u0e32\u0e23\u0e13\u0e4c)"
  )
);

// Job 1
children.push(
  makeH2(
    "Timeline \u2014 Job 1: Noble Development PCL (Feb 2021 \u2013 Present)"
  )
);
children.push(
  makeTable([
    [
      "Badge",
      "Promoted Apr 2023",
      "\u0e40\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e15\u0e33\u0e41\u0e2b\u0e19\u0e48\u0e07 \u0e40\u0e21.\u0e22. 2566",
    ],
    [
      "Job Title",
      "Experience & Platform Support Manager / Product Owner",
      "\u0e1c\u0e39\u0e49\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e1d\u0e48\u0e32\u0e22\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e2f / Product Owner",
    ],
    [
      "Bullet 1",
      "Own & manage full digital portfolio: POS (CRM, Booking, Contract, Transfer) and Non-POS (Noble ID, Website, CMS, CDP, Payment)",
      "\u0e14\u0e39\u0e41\u0e25\u0e1e\u0e2d\u0e23\u0e4c\u0e15\u0e42\u0e1f\u0e25\u0e34\u0e42\u0e2d\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14: POS (CRM, Booking, Contract, Transfer) \u0e41\u0e25\u0e30 Non-POS (Noble ID, Website, CMS, CDP, Payment)",
    ],
    [
      "Bullet 2",
      "Drive end-to-end delivery \u2014 requirements, HLR/DLR docs, UX/UI review (Figma), QA, UAT, training, go-live & post-launch support",
      "\u0e02\u0e31\u0e1a\u0e40\u0e04\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23\u0e04\u0e23\u0e1a\u0e27\u0e07\u0e08\u0e23 \u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48 Requirements, HLR/DLR, \u0e23\u0e35\u0e27\u0e34\u0e27 UX/UI (Figma), QA, UAT, \u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21, Go-Live \u0e08\u0e19\u0e16\u0e36\u0e07\u0e14\u0e39\u0e41\u0e25\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e1b\u0e34\u0e14\u0e15\u0e31\u0e27",
    ],
    [
      "Bullet 3",
      "Report directly to SVP and C-Level, translating business strategy into actionable product roadmaps",
      "\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e15\u0e23\u0e07\u0e15\u0e48\u0e2d SVP \u0e41\u0e25\u0e30 C-Level \u0e41\u0e1b\u0e25\u0e01\u0e25\u0e22\u0e38\u0e17\u0e18\u0e4c\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08\u0e40\u0e1b\u0e47\u0e19\u0e41\u0e1c\u0e19 Roadmap \u0e17\u0e35\u0e48\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23\u0e44\u0e14\u0e49\u0e08\u0e23\u0e34\u0e07",
    ],
    [
      "Bullet 4",
      "Enforce dual quality gates: Dev Demo >=80% pass rate; lead final verification before every UAT cycle",
      "\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e43\u0e0a\u0e49 Quality Gate \u0e04\u0e39\u0e48: Demo >=80% \u0e1c\u0e48\u0e32\u0e19\u0e40\u0e01\u0e13\u0e11\u0e4c; \u0e19\u0e33\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e02\u0e31\u0e49\u0e19\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e01\u0e48\u0e2d\u0e19 UAT \u0e17\u0e38\u0e01\u0e23\u0e2d\u0e1a",
    ],
    [
      "Bullet 5",
      "Primary trainer for all system launches; go-to consultant for sales leadership on systems & new initiatives",
      "\u0e1c\u0e39\u0e49\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e2b\u0e25\u0e31\u0e01\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e17\u0e38\u0e01\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e34\u0e14\u0e15\u0e31\u0e27\u0e23\u0e30\u0e1a\u0e1a \u0e17\u0e35\u0e48\u0e1b\u0e23\u0e36\u0e01\u0e29\u0e32\u0e2b\u0e25\u0e31\u0e01\u0e02\u0e2d\u0e07\u0e1c\u0e39\u0e49\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e1d\u0e48\u0e32\u0e22\u0e02\u0e32\u0e22\u0e14\u0e49\u0e32\u0e19\u0e23\u0e30\u0e1a\u0e1a\u0e41\u0e25\u0e30\u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e43\u0e2b\u0e21\u0e48",
    ],
  ])
);

// Job 2
children.push(
  makeH2(
    "Timeline \u2014 Job 2: OMRON Corporation, Japan (2017 \u2013 2020)"
  )
);
children.push(
  makeTable([
    [
      "Job Title",
      "Manufacturing Operations Coordinator",
      "\u0e1c\u0e39\u0e49\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e1d\u0e48\u0e32\u0e22\u0e1b\u0e0f\u0e34\u0e1a\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e01\u0e32\u0e23\u0e1c\u0e25\u0e34\u0e15",
    ],
    [
      "Bullet 1",
      "Coordinated cross-departmental projects between Production and Manufacturing Engineering divisions",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e02\u0e49\u0e32\u0e21\u0e41\u0e1c\u0e19\u0e01\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e1d\u0e48\u0e32\u0e22\u0e1c\u0e25\u0e34\u0e15\u0e41\u0e25\u0e30\u0e27\u0e34\u0e28\u0e27\u0e01\u0e23\u0e23\u0e21\u0e01\u0e32\u0e23\u0e1c\u0e25\u0e34\u0e15",
    ],
    [
      "Bullet 2",
      "Prepared production efficiency reports and performed product quality inspections",
      "\u0e08\u0e31\u0e14\u0e17\u0e33\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e1b\u0e23\u0e30\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e20\u0e32\u0e1e\u0e01\u0e32\u0e23\u0e1c\u0e25\u0e34\u0e15\u0e41\u0e25\u0e30\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e20\u0e32\u0e1e\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c",
    ],
    [
      "Bullet 3",
      "Trained new interns; earned Basic Electronics Assembly Technician certification (Sep 2018)",
      "\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e19\u0e31\u0e01\u0e28\u0e36\u0e01\u0e29\u0e32\u0e1d\u0e36\u0e01\u0e07\u0e32\u0e19; \u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e1b\u0e23\u0e30\u0e01\u0e32\u0e28\u0e19\u0e35\u0e22\u0e1a\u0e31\u0e15\u0e23 Basic Electronics Assembly Technician (\u0e01.\u0e22. 2561)",
    ],
  ])
);

// Job 3
children.push(
  makeH2(
    "Timeline \u2014 Job 3: Continental City Co., Ltd. \u2014 IT Coordinator (2014 \u2013 2017)"
  )
);
children.push(
  makeTable([
    [
      "Job Title",
      "IT Coordinator (Officer)",
      "\u0e1c\u0e39\u0e49\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e14\u0e49\u0e32\u0e19\u0e44\u0e2d\u0e17\u0e35",
    ],
    [
      "Bullet 1",
      "Coordinated IT operations across internal users, suppliers, vendors, and service providers",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e1b\u0e0f\u0e34\u0e1a\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e44\u0e2d\u0e17\u0e35\u0e01\u0e31\u0e1a\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e20\u0e32\u0e22\u0e43\u0e19 \u0e0b\u0e31\u0e1e\u0e1e\u0e25\u0e32\u0e22\u0e40\u0e2d\u0e2d\u0e23\u0e4c \u0e40\u0e27\u0e19\u0e40\u0e14\u0e2d\u0e23\u0e4c \u0e41\u0e25\u0e30\u0e1c\u0e39\u0e49\u0e43\u0e2b\u0e49\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23",
    ],
    [
      "Bullet 2",
      "Managed annual IT planning and budget allocation; trained users on all organizational systems",
      "\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e41\u0e1c\u0e19\u0e07\u0e32\u0e19\u0e41\u0e25\u0e30\u0e07\u0e1a\u0e1b\u0e23\u0e30\u0e21\u0e32\u0e13\u0e44\u0e2d\u0e17\u0e35\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e1b\u0e35 \u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e17\u0e38\u0e01\u0e23\u0e30\u0e1a\u0e1a\u0e02\u0e2d\u0e07\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23",
    ],
  ])
);

// Job 4
children.push(
  makeH2(
    "Timeline \u2014 Job 4: Continental City Co., Ltd. \u2014 Systems Tester (2010 \u2013 2014)"
  )
);
children.push(
  makeTable([
    [
      "Job Title",
      "Systems Tester (Intern / Part-time)",
      "\u0e1c\u0e39\u0e49\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e23\u0e30\u0e1a\u0e1a (\u0e19\u0e31\u0e01\u0e28\u0e36\u0e01\u0e29\u0e32\u0e1d\u0e36\u0e01\u0e07\u0e32\u0e19 / \u0e1e\u0e32\u0e23\u0e4c\u0e17\u0e44\u0e17\u0e21\u0e4c)",
    ],
    [
      "Bullet 1",
      "Tested enterprise systems and provided user consultation on software usage during undergraduate studies",
      "\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e23\u0e30\u0e1a\u0e1a\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23\u0e41\u0e25\u0e30\u0e43\u0e2b\u0e49\u0e04\u0e33\u0e1b\u0e23\u0e36\u0e01\u0e29\u0e32\u0e01\u0e32\u0e23\u0e43\u0e0a\u0e49\u0e0b\u0e2d\u0e1f\u0e15\u0e4c\u0e41\u0e27\u0e23\u0e4c\u0e41\u0e01\u0e48\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32\u0e1b\u0e23\u0e34\u0e0d\u0e0d\u0e32\u0e15\u0e23\u0e35",
    ],
  ])
);

// === PAGE 3B: KEY PROJECTS ===
children.push(pageBreak());
children.push(
  makeH1(
    "Page 3B \u2014 KEY PROJECTS (\u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e2a\u0e33\u0e04\u0e31\u0e0d \u2014 Pop-up Modal)"
  )
);

// Project 1
children.push(makeH2("Project 1 \u2014 POS Ecosystem"));
children.push(
  makeTable([
    [
      "Project Name",
      "POS Ecosystem \u2014 First Product Owner",
      "\u0e23\u0e30\u0e1a\u0e1a POS \u2014 Product Owner \u0e04\u0e19\u0e41\u0e23\u0e01",
    ],
    [
      "Card Summary",
      "Appointed as the first-ever PO overseeing 18 modules across the entire property sales journey, managing 100+ RFC and New Business projects.",
      "\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e01\u0e32\u0e23\u0e41\u0e15\u0e48\u0e07\u0e15\u0e31\u0e49\u0e07\u0e40\u0e1b\u0e47\u0e19 PO \u0e04\u0e19\u0e41\u0e23\u0e01 \u0e14\u0e39\u0e41\u0e25 18 Module \u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23\u0e02\u0e32\u0e22\u0e2d\u0e2a\u0e31\u0e07\u0e2b\u0e32\u0e2f \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14 \u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23 RFC \u0e41\u0e25\u0e30 New Business \u0e01\u0e27\u0e48\u0e32 100+ \u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23",
    ],
    [
      "Modal Desc",
      "Appointed as Noble Development's first-ever dedicated Product Owner for the POS ecosystem \u2014 a mission-critical platform spanning 18 modules that powers every step of the property sales journey, from customer registration and unit booking to contract execution and ownership transfer. During this tenure, the backlog grew to include over 100 RFC (Request for Change) and New Business initiatives, each requiring full end-to-end ownership: requirement analysis, UX/UI review in Figma, development coordination, quality gate enforcement, UAT management, and user training. This role established the foundational product standards, documentation practices, and QA processes that remain in use across the portfolio today.",
      "\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e01\u0e32\u0e23\u0e41\u0e15\u0e48\u0e07\u0e15\u0e31\u0e49\u0e07\u0e40\u0e1b\u0e47\u0e19 Product Owner \u0e04\u0e19\u0e41\u0e23\u0e01\u0e17\u0e35\u0e48\u0e23\u0e31\u0e1a\u0e1c\u0e34\u0e14\u0e0a\u0e2d\u0e1a\u0e23\u0e30\u0e1a\u0e1a POS \u0e02\u0e2d\u0e07 Noble Development \u0e2d\u0e22\u0e48\u0e32\u0e07\u0e40\u0e15\u0e47\u0e21\u0e15\u0e31\u0e27 \u2014 \u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e2b\u0e25\u0e31\u0e01\u0e17\u0e35\u0e48\u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21 18 Module \u0e02\u0e31\u0e1a\u0e40\u0e04\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e17\u0e38\u0e01\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e02\u0e2d\u0e07\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23\u0e02\u0e32\u0e22\u0e2d\u0e2a\u0e31\u0e07\u0e2b\u0e32\u0e23\u0e34\u0e21\u0e17\u0e23\u0e31\u0e1e\u0e22\u0e4c \u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e01\u0e32\u0e23\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32 \u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e22\u0e39\u0e19\u0e34\u0e15 \u0e01\u0e32\u0e23\u0e17\u0e33\u0e2a\u0e31\u0e0d\u0e0d\u0e32 \u0e08\u0e19\u0e16\u0e36\u0e07\u0e01\u0e32\u0e23\u0e42\u0e2d\u0e19\u0e01\u0e23\u0e23\u0e21\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c \u0e15\u0e25\u0e2d\u0e14\u0e23\u0e30\u0e22\u0e30\u0e40\u0e27\u0e25\u0e32\u0e17\u0e35\u0e48\u0e14\u0e39\u0e41\u0e25 \u0e21\u0e35 RFC \u0e41\u0e25\u0e30 New Business \u0e2a\u0e30\u0e2a\u0e21\u0e01\u0e27\u0e48\u0e32 100+ \u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23 \u0e1a\u0e17\u0e1a\u0e32\u0e17\u0e19\u0e35\u0e49\u0e27\u0e32\u0e07\u0e23\u0e32\u0e01\u0e10\u0e32\u0e19 Product Standard, \u0e41\u0e19\u0e27\u0e17\u0e32\u0e07\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23 QA \u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e04\u0e07\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19\u0e2d\u0e22\u0e39\u0e48\u0e43\u0e19\u0e17\u0e38\u0e01\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49",
    ],
    [
      "Bullet 1",
      "18 modules covering the full sales cycle: CRM -> Booking -> Contract -> Transfer",
      "18 Module \u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21\u0e27\u0e07\u0e08\u0e23\u0e01\u0e32\u0e23\u0e02\u0e32\u0e22\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14: CRM -> Booking -> Contract -> Transfer",
    ],
    [
      "Bullet 2",
      "Managed 100+ RFC and New Business projects end-to-end",
      "\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23 RFC \u0e41\u0e25\u0e30 New Business \u0e01\u0e27\u0e48\u0e32 100+ \u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e04\u0e23\u0e1a\u0e27\u0e07\u0e08\u0e23",
    ],
    [
      "Bullet 3",
      "Established HLR/DLR documentation standards used across the POS portfolio",
      "\u0e27\u0e32\u0e07\u0e21\u0e32\u0e15\u0e23\u0e10\u0e32\u0e19\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23 HLR/DLR \u0e17\u0e35\u0e48\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19\u0e17\u0e31\u0e48\u0e27\u0e1e\u0e2d\u0e23\u0e4c\u0e15\u0e42\u0e1f\u0e25\u0e34\u0e42\u0e2d POS",
    ],
    [
      "Bullet 4",
      "Enforced dual quality gates: Dev Demo >=80% pass rate before proceeding to UAT",
      "\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e43\u0e0a\u0e49 Quality Gate \u0e04\u0e39\u0e48: Demo >=80% \u0e01\u0e48\u0e2d\u0e19\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23 UAT",
    ],
    [
      "Bullet 5",
      "Led user training sessions for sales staff on every major system release",
      "\u0e19\u0e33\u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19\u0e02\u0e32\u0e22\u0e43\u0e19\u0e17\u0e38\u0e01 Major Release",
    ],
    [
      "Bullet 6",
      "Direct reporting line to SVP; aligned product direction with C-Level business priorities",
      "\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e15\u0e23\u0e07\u0e15\u0e48\u0e2d SVP; \u0e08\u0e31\u0e14\u0e41\u0e19\u0e27\u0e17\u0e34\u0e28\u0e17\u0e32\u0e07 Product \u0e43\u0e2b\u0e49\u0e2a\u0e2d\u0e14\u0e04\u0e25\u0e49\u0e2d\u0e07\u0e01\u0e31\u0e1a\u0e01\u0e25\u0e22\u0e38\u0e17\u0e18\u0e4c C-Level",
    ],
  ])
);

// Project 2
children.push(makeH2("Project 2 \u2014 ERP Migration"));
children.push(
  makeTable([
    [
      "Project Name",
      "ERP Migration \u2014 Sales System PM",
      "\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e23\u0e30\u0e1a\u0e1a ERP \u2014 PM \u0e1d\u0e31\u0e48\u0e07\u0e23\u0e30\u0e1a\u0e1a\u0e07\u0e32\u0e19\u0e02\u0e32\u0e22",
    ],
    [
      "Card Summary",
      "Led the POS-REM integration in a company-wide ERP overhaul (RMS -> ICON Framework REM). 8-10 months, Go-Live May 15, 2024.",
      "\u0e19\u0e33\u0e01\u0e32\u0e23\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d POS-REM \u0e43\u0e19\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19 ERP \u0e17\u0e31\u0e49\u0e07\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 (RMS -> ICON Framework REM) 8-10 \u0e40\u0e14\u0e37\u0e2d\u0e19 Go-Live 15 \u0e1e.\u0e04. 2567",
    ],
    [
      "Modal Desc",
      "Served as Project Manager for the sales system workstream in Noble Development's largest-ever IT transformation \u2014 a full enterprise ERP migration from the legacy RMS platform to the new ICON Framework (REM). This initiative required meticulous coordination across technology, business, and operations teams to ensure a seamless transition without disrupting ongoing sales activities. Managed the complex technical integration between the existing POS ecosystem and the new REM system, overseeing data mapping, migration validation, regression testing, and end-user training. The project ran for approximately 8-10 months and concluded with a flawless Go-Live on May 15, 2024. Now recognized internally as the company's subject matter expert on POS-REM integration.",
      "\u0e23\u0e31\u0e1a\u0e1a\u0e17\u0e1a\u0e32\u0e17 Project Manager \u0e1d\u0e31\u0e48\u0e07\u0e23\u0e30\u0e1a\u0e1a\u0e07\u0e32\u0e19\u0e02\u0e32\u0e22\u0e43\u0e19\u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23 IT Transformation \u0e04\u0e23\u0e31\u0e49\u0e07\u0e43\u0e2b\u0e0d\u0e48\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14\u0e02\u0e2d\u0e07 Noble Development \u2014 \u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e23\u0e30\u0e1a\u0e1a ERP \u0e17\u0e31\u0e49\u0e07\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17\u0e08\u0e32\u0e01\u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21 RMS \u0e40\u0e14\u0e34\u0e21\u0e2a\u0e39\u0e48 ICON Framework (REM) \u0e43\u0e2b\u0e21\u0e48 \u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e01\u0e32\u0e23\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d\u0e17\u0e32\u0e07\u0e40\u0e17\u0e04\u0e19\u0e34\u0e04\u0e17\u0e35\u0e48\u0e0b\u0e31\u0e1a\u0e0b\u0e49\u0e2d\u0e19\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e23\u0e30\u0e1a\u0e1a POS \u0e01\u0e31\u0e1a REM \u0e14\u0e39\u0e41\u0e25 Data Mapping, Migration Validation, Regression Testing \u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e17\u0e31\u0e48\u0e27\u0e17\u0e31\u0e49\u0e07\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23 \u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e43\u0e0a\u0e49\u0e40\u0e27\u0e25\u0e32 ~8-10 \u0e40\u0e14\u0e37\u0e2d\u0e19 \u0e2a\u0e34\u0e49\u0e19\u0e2a\u0e38\u0e14\u0e14\u0e49\u0e27\u0e22 Go-Live \u0e17\u0e35\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 15 \u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21 2567",
    ],
    [
      "Bullet 1",
      "Led sales system workstream across the full RMS -> REM migration",
      "\u0e19\u0e33 Workstream \u0e23\u0e30\u0e1a\u0e1a\u0e07\u0e32\u0e19\u0e02\u0e32\u0e22\u0e15\u0e25\u0e2d\u0e14\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19 RMS -> REM",
    ],
    [
      "Bullet 2",
      "Managed POS-REM integration: technical mapping, API alignment, and data validation",
      "\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23 POS-REM Integration: Technical Mapping, API Alignment \u0e41\u0e25\u0e30 Data Validation",
    ],
    [
      "Bullet 3",
      "Oversaw complete data migration and integrity verification",
      "\u0e14\u0e39\u0e41\u0e25 Data Migration \u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e04\u0e23\u0e1a\u0e16\u0e49\u0e27\u0e19",
    ],
    [
      "Bullet 4",
      "Coordinated regression and UAT testing across all affected modules",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19 Regression Testing \u0e41\u0e25\u0e30 UAT \u0e17\u0e38\u0e01 Module \u0e17\u0e35\u0e48\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e1c\u0e25\u0e01\u0e23\u0e30\u0e17\u0e1a",
    ],
    [
      "Bullet 5",
      "Planned and executed company-wide user training program pre-Go-Live",
      "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e41\u0e25\u0e30\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e17\u0e31\u0e48\u0e27\u0e17\u0e31\u0e49\u0e07\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23\u0e01\u0e48\u0e2d\u0e19 Go-Live",
    ],
    [
      "Bullet 6",
      "Successful Go-Live on May 15, 2024 \u2014 zero critical incidents on launch day",
      "Go-Live \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 15 \u0e1e.\u0e04. 2567 \u2014 \u0e44\u0e21\u0e48\u0e21\u0e35 Critical Incident \u0e27\u0e31\u0e19\u0e40\u0e1b\u0e34\u0e14\u0e15\u0e31\u0e27",
    ],
  ])
);

// Project 3
children.push(makeH2("Project 3 \u2014 Nue Epic Presale"));
children.push(
  makeTable([
    [
      "Project Name",
      "Nue Epic Presale \u2014 Large-Scale Event",
      "Nue Epic Presale \u2014 \u0e07\u0e32\u0e19 Presale \u0e02\u0e19\u0e32\u0e14\u0e43\u0e2b\u0e0d\u0e48",
    ],
    [
      "Card Summary",
      "Orchestrated a flagship presale event coordinating 100+ staff. Designed the full operation flow, built registration & booking systems from scratch.",
      "\u0e08\u0e31\u0e14\u0e07\u0e32\u0e19 Presale \u0e04\u0e2d\u0e19\u0e42\u0e14\u0e49 Flagship \u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e17\u0e35\u0e21\u0e07\u0e32\u0e19 100+ \u0e04\u0e19 \u0e2d\u0e2d\u0e01\u0e41\u0e1a\u0e1a Operation Flow \u0e41\u0e25\u0e30\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e23\u0e30\u0e1a\u0e1a\u0e08\u0e2d\u0e07+\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e15\u0e49\u0e19",
    ],
    [
      "Modal Desc",
      "Planned and orchestrated a large-scale presale event for Nue Epic, a flagship high-rise condominium \u2014 a format Noble Development had not executed in years. Designed the entire operation flow from the ground up, built a custom booking and registration system, and prepared a comprehensive training program with multiple run-through rehearsals to ensure 100+ staff were fully prepared. Served as the primary coordinator between operations and senior management, engaging directly with C-Level executives and VPs on event strategy, risk mitigation, and real-time decision-making.",
      "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e41\u0e25\u0e30\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e07\u0e32\u0e19 Presale \u0e02\u0e19\u0e32\u0e14\u0e43\u0e2b\u0e0d\u0e48\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a Nue Epic \u0e04\u0e2d\u0e19\u0e42\u0e14\u0e21\u0e34\u0e40\u0e19\u0e35\u0e22\u0e21 High-Rise \u0e40\u0e23\u0e37\u0e2d\u0e18\u0e07 \u0e2d\u0e2d\u0e01\u0e41\u0e1a\u0e1a\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e01\u0e32\u0e23\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e07\u0e32\u0e19\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e15\u0e49\u0e19 \u0e1e\u0e31\u0e12\u0e19\u0e32\u0e23\u0e30\u0e1a\u0e1a\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e30\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19 \u0e08\u0e31\u0e14\u0e17\u0e33\u0e41\u0e1c\u0e19\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e41\u0e25\u0e30\u0e0b\u0e49\u0e2d\u0e21 Run-through \u0e2b\u0e25\u0e32\u0e22\u0e23\u0e2d\u0e1a \u0e17\u0e33\u0e2b\u0e19\u0e49\u0e32\u0e17\u0e35\u0e48\u0e1c\u0e39\u0e49\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e2b\u0e25\u0e31\u0e01\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e17\u0e35\u0e21\u0e1b\u0e0f\u0e34\u0e1a\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e41\u0e25\u0e30\u0e1c\u0e39\u0e49\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23 \u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e42\u0e14\u0e22\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a C-Level \u0e41\u0e25\u0e30 VP",
    ],
    [
      "Bullet 1",
      "Designed full operation flow for a single-day mass presale event from scratch",
      "\u0e2d\u0e2d\u0e01\u0e41\u0e1a\u0e1a Operation Flow \u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e07\u0e32\u0e19 Presale \u0e41\u0e1a\u0e1a Single-Day \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e15\u0e49\u0e19",
    ],
    [
      "Bullet 2",
      "Developed custom booking and registration systems specifically for the event",
      "\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e23\u0e30\u0e1a\u0e1a\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e30\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e07\u0e32\u0e19\u0e19\u0e35\u0e49\u0e42\u0e14\u0e22\u0e40\u0e09\u0e1e\u0e32\u0e30",
    ],
    [
      "Bullet 3",
      "Coordinated and trained a 100+ person team across multiple departments",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e41\u0e25\u0e30\u0e1d\u0e36\u0e01\u0e2d\u0e1a\u0e23\u0e21\u0e17\u0e35\u0e21\u0e07\u0e32\u0e19\u0e01\u0e27\u0e48\u0e32 100 \u0e04\u0e19\u0e08\u0e32\u0e01\u0e2b\u0e25\u0e32\u0e22\u0e41\u0e1c\u0e19\u0e01",
    ],
    [
      "Bullet 4",
      "Ran multiple rehearsals and run-throughs to ensure execution readiness",
      "\u0e0b\u0e49\u0e2d\u0e21 Run-through \u0e2b\u0e25\u0e32\u0e22\u0e23\u0e2d\u0e1a\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e43\u0e2b\u0e49\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e07\u0e32\u0e19",
    ],
    [
      "Bullet 5",
      "Direct liaison with C-Level and VP on strategy, risk, and escalations",
      "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e42\u0e14\u0e22\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a C-Level \u0e41\u0e25\u0e30 VP \u0e14\u0e49\u0e32\u0e19\u0e01\u0e25\u0e22\u0e38\u0e17\u0e18\u0e4c \u0e04\u0e27\u0e32\u0e21\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07 \u0e41\u0e25\u0e30\u0e01\u0e32\u0e23 Escalation",
    ],
    [
      "Bullet 6",
      "Event executed without critical incidents \u2014 new operational benchmark established",
      "\u0e07\u0e32\u0e19\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e21\u0e35 Critical Incident \u2014 \u0e2a\u0e23\u0e49\u0e32\u0e07\u0e21\u0e32\u0e15\u0e23\u0e10\u0e32\u0e19\u0e1b\u0e0f\u0e34\u0e1a\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e43\u0e2b\u0e21\u0e48",
    ],
  ])
);

// Project 4
children.push(makeH2("Project 4 \u2014 Non-POS Portfolio Takeover"));
children.push(
  makeTable([
    [
      "Project Name",
      "Non-POS Portfolio Takeover",
      "\u0e23\u0e31\u0e1a\u0e42\u0e2d\u0e19 Non-POS Portfolio \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
    ],
    [
      "Card Summary",
      "Assumed sole ownership of Noble ID, Website, CMS, CDP & Payment when the previous PO resigned \u2014 becoming the company's only PO for all digital products.",
      "\u0e23\u0e31\u0e1a\u0e42\u0e2d\u0e19\u0e04\u0e27\u0e32\u0e21\u0e23\u0e31\u0e1a\u0e1c\u0e34\u0e14\u0e0a\u0e2d\u0e1a Noble ID, Website, CMS, CDP \u0e41\u0e25\u0e30 Payment \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e40\u0e21\u0e37\u0e48\u0e2d PO \u0e04\u0e19\u0e01\u0e48\u0e2d\u0e19\u0e25\u0e32\u0e2d\u0e2d\u0e01 \u0e01\u0e25\u0e32\u0e22\u0e40\u0e1b\u0e47\u0e19 PO \u0e40\u0e1e\u0e35\u0e22\u0e07\u0e04\u0e19\u0e40\u0e14\u0e35\u0e22\u0e27\u0e02\u0e2d\u0e07\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17",
    ],
    [
      "Modal Desc",
      "When the previous Product Owner resigned in May 2025, assumed sole and immediate ownership of Noble Development's entire Non-POS digital ecosystem. The portfolio encompasses Noble ID (customer identity platform), Noble Home website, CMS, CDP, and the Payment Installment system supporting credit cards, Visa, and PromptPay. This rapid transition required onboarding across multiple complex systems in parallel while maintaining full business continuity and continuing active roadmap delivery.",
      "\u0e40\u0e21\u0e37\u0e48\u0e2d PO \u0e04\u0e19\u0e01\u0e48\u0e2d\u0e19\u0e25\u0e32\u0e2d\u0e2d\u0e01\u0e43\u0e19\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21 2568 \u0e23\u0e31\u0e1a\u0e42\u0e2d\u0e19\u0e04\u0e27\u0e32\u0e21\u0e23\u0e31\u0e1a\u0e1c\u0e34\u0e14\u0e0a\u0e2d\u0e1a Non-POS \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e41\u0e15\u0e48\u0e40\u0e1e\u0e35\u0e22\u0e07\u0e1c\u0e39\u0e49\u0e40\u0e14\u0e35\u0e22\u0e27 Non-POS Portfolio \u0e04\u0e23\u0e2d\u0e1a\u0e04\u0e25\u0e38\u0e21 Noble ID, Noble Home Website, CMS, CDP \u0e41\u0e25\u0e30\u0e23\u0e30\u0e1a\u0e1a\u0e1c\u0e48\u0e2d\u0e19\u0e0a\u0e33\u0e23\u0e30\u0e17\u0e35\u0e48\u0e23\u0e2d\u0e07\u0e23\u0e31\u0e1a\u0e1a\u0e31\u0e15\u0e23\u0e40\u0e04\u0e23\u0e14\u0e34\u0e15 Visa \u0e41\u0e25\u0e30 PromptPay \u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e1c\u0e48\u0e32\u0e19\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e19\u0e23\u0e39\u0e49\u0e23\u0e30\u0e1a\u0e1a\u0e2b\u0e25\u0e32\u0e22\u0e23\u0e30\u0e1a\u0e1a\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e01\u0e31\u0e19 \u0e02\u0e13\u0e30\u0e23\u0e31\u0e01\u0e29\u0e32\u0e04\u0e27\u0e32\u0e21\u0e15\u0e48\u0e2d\u0e40\u0e19\u0e37\u0e48\u0e2d\u0e07\u0e17\u0e32\u0e07\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
    ],
    [
      "Bullet 1",
      "Assumed ownership of 5 platforms simultaneously: Noble ID, Website, CMS, CDP, Payment",
      "\u0e23\u0e31\u0e1a\u0e42\u0e2d\u0e19 5 \u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e01\u0e31\u0e19: Noble ID, Website, CMS, CDP, Payment",
    ],
    [
      "Bullet 2",
      "Rapid cross-system onboarding while maintaining zero business continuity disruption",
      "Onboard \u0e02\u0e49\u0e32\u0e21\u0e23\u0e30\u0e1a\u0e1a\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e23\u0e27\u0e14\u0e40\u0e23\u0e47\u0e27\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e01\u0e23\u0e30\u0e17\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e15\u0e48\u0e2d\u0e40\u0e19\u0e37\u0e48\u0e2d\u0e07\u0e17\u0e32\u0e07\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
    ],
    [
      "Bullet 3",
      "Established new communication frameworks with development teams across all platforms",
      "\u0e2a\u0e23\u0e49\u0e32\u0e07 Framework \u0e01\u0e32\u0e23\u0e2a\u0e37\u0e48\u0e2d\u0e2a\u0e32\u0e23\u0e43\u0e2b\u0e21\u0e48\u0e01\u0e31\u0e1a\u0e17\u0e35\u0e21\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e17\u0e38\u0e01\u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21",
    ],
    [
      "Bullet 4",
      "Noble ID: Customer identity, authentication, and loyalty platform",
      "Noble ID: \u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e23\u0e30\u0e1a\u0e38\u0e15\u0e31\u0e27\u0e15\u0e19 \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e15\u0e31\u0e27 \u0e41\u0e25\u0e30 Loyalty \u0e02\u0e2d\u0e07\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32",
    ],
    [
      "Bullet 5",
      "Payment system: Supports credit card, Visa, and PromptPay channels",
      "\u0e23\u0e30\u0e1a\u0e1a Payment: \u0e23\u0e2d\u0e07\u0e23\u0e31\u0e1a\u0e1a\u0e31\u0e15\u0e23\u0e40\u0e04\u0e23\u0e14\u0e34\u0e15 Visa \u0e41\u0e25\u0e30 PromptPay",
    ],
    [
      "Bullet 6",
      "Serves as sole PO for the company's complete 8+ product digital portfolio",
      "\u0e23\u0e31\u0e1a\u0e1c\u0e34\u0e14\u0e0a\u0e2d\u0e1a Digital Portfolio \u0e04\u0e23\u0e1a\u0e16\u0e49\u0e27\u0e19 8+ \u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e40\u0e1e\u0e35\u0e22\u0e07\u0e04\u0e19\u0e40\u0e14\u0e35\u0e22\u0e27",
    ],
  ])
);

// === PAGE 4: SKILLS ===
children.push(pageBreak());
children.push(
  makeH1("Page 4 \u2014 SKILLS (\u0e17\u0e31\u0e01\u0e29\u0e30)")
);
children.push(
  makeTable([
    [
      "Eyebrow",
      "Capabilities",
      "\u0e04\u0e27\u0e32\u0e21\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16",
    ],
    [
      "Heading",
      "Skills & Tools",
      "\u0e17\u0e31\u0e01\u0e29\u0e30 \u0e41\u0e25\u0e30\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d",
    ],
    [
      "Category 1",
      "Management",
      "\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23",
    ],
    ["Category 2", "Technical", "\u0e40\u0e17\u0e04\u0e19\u0e34\u0e04"],
    [
      "Category 3",
      "Tools",
      "\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d",
    ],
    [
      "Language 1",
      "Thai \u2014 Native",
      "\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22 \u2014 \u0e20\u0e32\u0e29\u0e32\u0e41\u0e21\u0e48",
    ],
    [
      "Language 2",
      "English \u2014 Working Proficiency",
      "\u0e20\u0e32\u0e29\u0e32\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29 \u2014 \u0e23\u0e30\u0e14\u0e31\u0e1a\u0e17\u0e33\u0e07\u0e32\u0e19",
    ],
    [
      "Language 3",
      "Japanese \u2014 Conversational (3 yrs in Japan)",
      "\u0e20\u0e32\u0e29\u0e32\u0e0d\u0e35\u0e48\u0e1b\u0e38\u0e48\u0e19 \u2014 \u0e2a\u0e19\u0e17\u0e19\u0e32\u0e44\u0e14\u0e49 (3 \u0e1b\u0e35\u0e43\u0e19\u0e0d\u0e35\u0e48\u0e1b\u0e38\u0e48\u0e19)",
    ],
    [
      "Cert Section Title",
      "Certifications",
      "\u0e43\u0e1a\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07",
    ],
    ["Cert 1 - Name", "CompTIA Project+", "CompTIA Project+"],
    [
      "Cert 1 - Date",
      "Issued Jul 2025",
      "\u0e2d\u0e2d\u0e01\u0e43\u0e2b\u0e49 \u0e01.\u0e04. 2568",
    ],
    [
      "Cert 2 - Name",
      "CompTIA Security+ (SY0-601)",
      "CompTIA Security+ (SY0-601)",
    ],
    [
      "Cert 2 - Date",
      "Issued Jul 2024 \u00b7 Valid through Jul 2027",
      "\u0e2d\u0e2d\u0e01\u0e43\u0e2b\u0e49 \u0e01.\u0e04. 2567 \u00b7 \u0e43\u0e0a\u0e49\u0e44\u0e14\u0e49\u0e16\u0e36\u0e07 \u0e01.\u0e04. 2570",
    ],
    [
      "Cert 3 - Name",
      "Basic Electronics Assembly Technician",
      "Basic Electronics Assembly Technician",
    ],
    [
      "Cert 3 - Date",
      "Japan \u00b7 Sep 2018",
      "\u0e0d\u0e35\u0e48\u0e1b\u0e38\u0e48\u0e19 \u00b7 \u0e01.\u0e22. 2561",
    ],
  ])
);

// === PAGE 5: EDUCATION ===
children.push(pageBreak());
children.push(
  makeH1(
    "Page 5 \u2014 EDUCATION (\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32)"
  )
);
children.push(
  makeTable([
    [
      "Eyebrow",
      "Academic Background",
      "\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32",
    ],
    [
      "Heading",
      "Education",
      "\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32",
    ],
    [
      "Degree 1 - Level",
      "M.Sc. Information Technology Management (ITM)",
      "\u0e27\u0e34\u0e17\u0e22\u0e32\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e21\u0e2b\u0e32\u0e1a\u0e31\u0e13\u0e11\u0e34\u0e15 \u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35\u0e2a\u0e32\u0e23\u0e2a\u0e19\u0e40\u0e17\u0e28 (ITM)",
    ],
    [
      "Degree 1 - School",
      "NIDA \u2014 National Institute of Development Administration \u00b7 Faculty of Applied Statistics",
      "\u0e2a\u0e16\u0e32\u0e1a\u0e31\u0e19\u0e1a\u0e31\u0e13\u0e11\u0e34\u0e15\u0e1e\u0e31\u0e12\u0e19\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e4c (NIDA) \u00b7 \u0e04\u0e13\u0e30\u0e2a\u0e16\u0e34\u0e15\u0e34\u0e1b\u0e23\u0e30\u0e22\u0e38\u0e01\u0e15\u0e4c",
    ],
    [
      "Degree 1 - Year/GPA",
      "2024\u20132026 \u00b7 GPA 3.74",
      "2567\u20132569 \u00b7 GPA 3.74",
    ],
    [
      "Degree 2 - Level",
      "B.Sc. Information Technology",
      "\u0e27\u0e34\u0e17\u0e22\u0e32\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e1a\u0e31\u0e13\u0e11\u0e34\u0e15 \u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35\u0e2a\u0e32\u0e23\u0e2a\u0e19\u0e40\u0e17\u0e28",
    ],
    [
      "Degree 2 - School",
      "Southeast Bangkok College",
      "\u0e27\u0e34\u0e17\u0e22\u0e32\u0e25\u0e31\u0e22\u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35\u0e10\u0e32\u0e19\u0e40\u0e2d\u0e40\u0e0a\u0e35\u0e22",
    ],
    [
      "Degree 2 - Year/GPA",
      "2010\u20132014 \u00b7 First Class Honors \u00b7 GPA 3.66",
      "2553\u20132557 \u00b7 \u0e40\u0e01\u0e35\u0e22\u0e23\u0e15\u0e34\u0e19\u0e34\u0e22\u0e21\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\u0e2b\u0e19\u0e36\u0e48\u0e07 \u00b7 GPA 3.66",
    ],
    [
      "Degree 3 - Level",
      "Vocational Certificate, Business Computer",
      "\u0e1b\u0e23\u0e30\u0e01\u0e32\u0e28\u0e19\u0e35\u0e22\u0e1a\u0e31\u0e15\u0e23\u0e27\u0e34\u0e0a\u0e32\u0e0a\u0e35\u0e1e (\u0e1b\u0e27\u0e0a.) \u0e04\u0e2d\u0e21\u0e1e\u0e34\u0e27\u0e40\u0e15\u0e2d\u0e23\u0e4c\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
    ],
    [
      "Degree 3 - School",
      "Attawit Commercial Technology College",
      "\u0e27\u0e34\u0e17\u0e22\u0e32\u0e25\u0e31\u0e22\u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35\u0e2d\u0e23\u0e23\u0e16\u0e27\u0e34\u0e17\u0e22\u0e4c\u0e1e\u0e32\u0e13\u0e34\u0e0a\u0e22\u0e01\u0e32\u0e23",
    ],
    [
      "Degree 3 - Year/GPA",
      "2007\u20132010 \u00b7 GPA 3.62",
      "2550\u20132553 \u00b7 GPA 3.62",
    ],
  ])
);

// === PAGE 6: CONTACT ===
children.push(pageBreak());
children.push(
  makeH1(
    "Page 6 \u2014 CONTACT (\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d)"
  )
);
children.push(
  makeTable([
    [
      "Eyebrow",
      "Get In Touch",
      "\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d",
    ],
    [
      "Heading",
      "Let's Connect",
      "\u0e21\u0e32\u0e04\u0e38\u0e22 \u0e01\u0e31\u0e19\u0e40\u0e16\u0e2d\u0e30",
    ],
    [
      "Quote",
      "\u201cI'm always open to meaningful conversations about product, technology, and new opportunities.\u201d",
      "\u201c\u0e22\u0e34\u0e19\u0e14\u0e35\u0e40\u0e2a\u0e21\u0e2d\u0e17\u0e35\u0e48\u0e08\u0e30\u0e1e\u0e39\u0e14\u0e04\u0e38\u0e22\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c \u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35 \u0e41\u0e25\u0e30\u0e42\u0e2d\u0e01\u0e32\u0e2a\u0e43\u0e2b\u0e21\u0e48\u0e46 \u0e17\u0e35\u0e48\u0e19\u0e48\u0e32\u0e2a\u0e19\u0e43\u0e08\u201d",
    ],
    [
      "Label - Email",
      "Email",
      "\u0e2d\u0e35\u0e40\u0e21\u0e25",
    ],
    [
      "Label - Phone",
      "Phone",
      "\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c",
    ],
    [
      "Label - Location",
      "Location",
      "\u0e17\u0e35\u0e48\u0e15\u0e31\u0e49\u0e07",
    ],
    [
      "Value - Location",
      "Samsen Nai, Phaya Thai, Bangkok",
      "\u0e2a\u0e32\u0e21\u0e40\u0e2a\u0e19\u0e43\u0e19 \u0e1e\u0e0d\u0e32\u0e44\u0e17 \u0e01\u0e23\u0e38\u0e07\u0e40\u0e17\u0e1e\u0e2f",
    ],
  ])
);

// ─── Assemble document ────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 18 },
      },
    },
  },
  sections: [
    {
      properties: pageProps,
      footers: {
        default: makeFooter(),
      },
      children,
    },
  ],
});

// ─── Write output ─────────────────────────────────────────────────────────────
const outputPath = "D:/Cony-AI/Portfolio/Portfolio_Content_Bilingual.docx";

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log("SUCCESS: Document written to " + outputPath);
    console.log("File size: " + buffer.length + " bytes");
  })
  .catch((err) => {
    console.error("ERROR:", err);
    process.exit(1);
  });
