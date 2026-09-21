#!/usr/bin/env python3
"""Zet de subsidieaanvragen (markdown) om naar Word in de Velo Vital-huisstijl.

Huisstijl: roze FF2FB2, oranje FF8C23, paars 8000FF, ink 1A0B18, cream FFF6EF.
Koppen in Montserrat, bodytekst in Montserrat, titel in TAN MERINGUE.

Gebruik: python3 md_naar_docx_huisstijl.py
"""

import os
import re

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Emu, Inches, Pt, RGBColor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PINK = RGBColor(0xFF, 0x2F, 0xB2)
ORANGE = RGBColor(0xFF, 0x8C, 0x23)
PURPLE = RGBColor(0x80, 0x00, 0xFF)
INK = RGBColor(0x1A, 0x0B, 0x18)
MUTED = RGBColor(0x6B, 0x5A, 0x68)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

HEX_PINK = "FF2FB2"
HEX_ORANGE = "FF8C23"
HEX_PURPLE = "8000FF"
HEX_CREAM = "FFF6EF"
HEX_GRID = "F0DFD3"

BODY_FONT = "Montserrat"
DISPLAY_FONT = "TAN MERINGUE"

DOCS = [
    {
        "md": "breda-kleine-initiatieven/stukken/aanvraag-breda-kleine-initiatieven.md",
        "docx": "breda-kleine-initiatieven/stukken/Velo_Vital_Aanvraag_Breda_Kleine_Initiatieven.docx",
        "kop": "Subsidieaanvraag Kleine initiatieven 2026",
        "sub": "Gemeente Breda",
        "header": "Velo Vital | Subsidieaanvraag gemeente Breda",
    },
    {
        "md": "breda-samen-doorpakken-2027/stukken/aanvraag-breda-samen-doorpakken.md",
        "docx": "breda-samen-doorpakken-2027/stukken/Velo_Vital_Aanvraag_Breda_Samen_Doorpakken_2027.docx",
        "kop": "Subsidieaanvraag Samen Doorpakken 2027",
        "sub": "Gemeente Breda | waardenetwerk Gezond en Actief Leven",
        "header": "Velo Vital | Samen Doorpakken 2027",
    },
    {
        "md": "tilburg-sociaal-en-veerkrachtig/stukken/aanvraag-tilburg-sociaal-en-veerkrachtig.md",
        "docx": "tilburg-sociaal-en-veerkrachtig/stukken/Velo_Vital_Aanvraag_Tilburg_Sociaal_en_Veerkrachtig.docx",
        "kop": "Subsidieaanvraag Sociaal en Veerkrachtig 2026-2027",
        "sub": "Gemeente Tilburg",
        "header": "Velo Vital | Sociaal en Veerkrachtig Tilburg",
    },
    {
        "md": "tilburg-inclusie-2027/stukken/aanvraag-tilburg-inclusie.md",
        "docx": "tilburg-inclusie-2027/stukken/Velo_Vital_Aanvraag_Tilburg_Inclusie.docx",
        "kop": "Subsidieaanvraag Inclusie 2026-2027",
        "sub": "Gemeente Tilburg",
        "header": "Velo Vital | Inclusie Tilburg",
    },
    {
        "md": "provincie-levendig-brabant-mix/stukken/aanvraag-provincie-levendig-brabant-mix.md",
        "docx": "provincie-levendig-brabant-mix/stukken/Velo_Vital_Aanvraag_Provincie_Levendig_Brabant_Mix.docx",
        "kop": "Subsidieaanvraag Levendig Brabant",
        "sub": "Provincie Noord-Brabant | cultuur, erfgoed, sport en vrije tijd in de Mix",
        "header": "Velo Vital | Levendig Brabant in de Mix",
    },
    {
        "md": "tilburg-sportakkoord/stukken/pitch-tilburgs-sportakkoord.md",
        "docx": "tilburg-sportakkoord/stukken/Velo_Vital_Pitch_Tilburgs_Sportakkoord.docx",
        "kop": "Pitch Tilburgs Sportakkoord",
        "sub": "Kennismaking en samenwerking",
        "header": "Velo Vital | Tilburgs Sportakkoord",
    },
]


# ---------------------------------------------------------------- low level


def _font(run, name=BODY_FONT):
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rfonts.set(qn(attr), name)


def set_run(run, size=10.5, color=INK, bold=False, italic=False, name=BODY_FONT):
    _font(run, name)
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.bold = bold
    run.italic = italic
    return run


def style_font(style, name=BODY_FONT, size=10.5, color=INK, bold=None):
    style.font.name = name
    rpr = style._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rfonts.set(qn(attr), name)
    style.font.size = Pt(size)
    style.font.color.rgb = color
    if bold is not None:
        style.font.bold = bold


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), fill)


def cell_margins(cell, top=110, start=150, bottom=110, end=150):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.find(qn("w:tcMar"))
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def table_borders(table, color=HEX_GRID, size="6", none=False):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), "none" if none else "single")
        el.set(qn("w:sz"), size)
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)


def table_width(table, width=9170, indent=108):
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(width))
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:type"), "dxa")
    tbl_ind.set(qn("w:w"), str(indent))


def column_widths(table, widths):
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for w in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(w))
        grid.append(col)
    for row in table.rows:
        for i, w in enumerate(widths):
            tc_pr = row.cells[i]._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:type"), "dxa")
            tc_w.set(qn("w:w"), str(w))


def rule(doc, color=HEX_ORANGE, size="14", space="4", after=10):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(after)
    p_pr = p._p.get_or_add_pPr()
    bdr = OxmlElement("w:pBdr")
    p_pr.append(bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    bdr.append(bottom)
    return p


# ---------------------------------------------------------------- inline md

BOLD = re.compile(r"\*\*(.+?)\*\*")


def add_rich(paragraph, text, size=10.5, color=INK, base_bold=False):
    pos = 0
    for m in BOLD.finditer(text):
        if m.start() > pos:
            set_run(paragraph.add_run(text[pos:m.start()]), size=size, color=color, bold=base_bold)
        set_run(paragraph.add_run(m.group(1)), size=size, color=color, bold=True)
        pos = m.end()
    if pos < len(text):
        set_run(paragraph.add_run(text[pos:]), size=size, color=color, bold=base_bold)
    return paragraph


# ---------------------------------------------------------------- blocks


def add_para(doc, text, size=10.5, color=INK, after=7, before=0, line=1.3, bold=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = line
    if text:
        add_rich(p, text, size=size, color=color, base_bold=bold)
    return p


def add_heading(doc, text, level):
    p = doc.add_paragraph(style=f"Heading {min(level, 3)}")
    p.paragraph_format.line_spacing = 1.15
    if level == 2:
        p.paragraph_format.space_before = Pt(17)
        p.paragraph_format.space_after = Pt(6)
        set_run(p.add_run(text), size=14.5, color=PURPLE, bold=True)
    else:
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        set_run(p.add_run(text), size=11.5, color=PINK, bold=True)
    return p


def add_bullet(doc, text, ordered=False):
    p = doc.add_paragraph(style="List Number" if ordered else "List Bullet")
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.25
    add_rich(p, text, size=10.5)
    return p


def add_table(doc, rows):
    header, body = rows[0], rows[1:]
    ncol = len(header)
    if ncol == 2:
        widths = [6670, 2500] if any(r[-1].strip().startswith("EUR") for r in body) else [2400, 6770]
    else:
        widths = [9170 // ncol] * ncol
        widths[-1] = 9170 - sum(widths[:-1])

    table = doc.add_table(rows=1, cols=ncol)
    table_width(table)
    column_widths(table, widths)
    table_borders(table)

    blank_header = not any(c.strip() for c in header)
    for i, text in enumerate(header):
        cell = table.rows[0].cells[i]
        shade(cell, HEX_CREAM)
        cell_margins(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        if not blank_header:
            add_rich(p, text, size=9.8, color=PURPLE, base_bold=True)

    for row in body:
        cells = table.add_row().cells
        emphasise = any("**" in c for c in row)
        for i, value in enumerate(row):
            cell = cells[i]
            cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if emphasise:
                shade(cell, HEX_CREAM)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.2
            if i == ncol - 1 and ncol == 2 and value.replace("*", "").strip().startswith("EUR"):
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            add_rich(p, value, size=9.6, color=INK)
    add_para(doc, "", after=8)
    return table


def add_callout(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table_width(table)
    column_widths(table, [9170])
    table_borders(table, none=True)
    cell = table.cell(0, 0)
    shade(cell, HEX_CREAM)
    cell_margins(cell, 180, 220, 180, 220)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.3
    add_rich(p, text, size=10.5, color=INK)
    add_para(doc, "", after=8)


def add_cover(doc, spec, title):
    table = doc.add_table(rows=1, cols=1)
    table_width(table)
    column_widths(table, [9170])
    table_borders(table, none=True)
    cell = table.cell(0, 0)
    shade(cell, HEX_PINK)
    cell_margins(cell, 420, 380, 420, 380)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    set_run(p.add_run("VELO VITAL"), size=11, color=WHITE, bold=True)
    p.runs[0].font.name = BODY_FONT

    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(6)
    p2.paragraph_format.line_spacing = 1.05
    set_run(p2.add_run(title), size=25, color=WHITE, bold=False, name=DISPLAY_FONT)

    if spec["kop"].strip().lower() != title.strip().lower():
        p3 = cell.add_paragraph()
        p3.paragraph_format.space_after = Pt(0)
        set_run(p3.add_run(spec["kop"]), size=11.5, color=WHITE, bold=True)

    p4 = cell.add_paragraph()
    p4.paragraph_format.space_after = Pt(0)
    set_run(p4.add_run(spec["sub"]), size=10.5, color=WHITE)

    add_para(doc, "", after=0)
    rule(doc, color=HEX_ORANGE, size="18", after=14)


# ---------------------------------------------------------------- parser


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def is_separator(line):
    return bool(re.fullmatch(r"\|[\s:|-]+\|", line.strip()))


def build(spec):
    md_path = os.path.join(BASE, spec["md"])
    out_path = os.path.join(BASE, spec["docx"])
    lines = open(md_path, encoding="utf-8").read().split("\n")

    doc = Document()
    section = doc.sections[0]
    section.page_width = Emu(7560000)   # A4: 210 mm
    section.page_height = Emu(10692000)  # A4: 297 mm
    section.top_margin = Inches(0.85)
    section.bottom_margin = Inches(0.85)
    section.left_margin = Inches(0.95)
    section.right_margin = Inches(0.95)

    styles = doc.styles
    style_font(styles["Normal"], size=10.5, color=INK)
    styles["Normal"].paragraph_format.space_after = Pt(7)
    styles["Normal"].paragraph_format.line_spacing = 1.3
    style_font(styles["Heading 1"], size=16, color=PURPLE, bold=True)
    style_font(styles["Heading 2"], size=14.5, color=PURPLE, bold=True)
    style_font(styles["Heading 3"], size=11.5, color=PINK, bold=True)
    for name in ("List Bullet", "List Number"):
        style_font(styles[name], size=10.5, color=INK)
        styles[name].paragraph_format.left_indent = Inches(0.32)
        styles[name].paragraph_format.first_line_indent = Inches(-0.19)

    hdr = section.header.paragraphs[0]
    hdr.text = spec["header"]
    set_run(hdr.runs[0], size=8.5, color=MUTED)
    ftr = section.footer.paragraphs[0]
    ftr.text = "Stichting Wielerevenementen Aalburg (handelsnaam Velo Vital) | KvK 60618167"
    ftr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    set_run(ftr.runs[0], size=8.5, color=MUTED)

    # titel uit de eerste H1
    title = spec["kop"]
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            break
    projecttitel = None
    for line in lines:
        if line.startswith("**Projecttitel:**"):
            projecttitel = line.split("**Projecttitel:**", 1)[1].strip()
            break
    add_cover(doc, spec, projecttitel or title)

    i = 0
    first_para_done = False
    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped.startswith("# "):
            i += 1
            continue

        if stripped == "---":
            rule(doc, color=HEX_GRID, size="8", after=10)
            i += 1
            continue

        if stripped.startswith("### "):
            add_heading(doc, stripped[4:].strip(), 3)
            i += 1
            continue

        if stripped.startswith("## "):
            add_heading(doc, stripped[3:].strip(), 2)
            i += 1
            continue

        if stripped.startswith("|") and i + 1 < len(lines) and is_separator(lines[i + 1]):
            rows = [split_row(stripped)]
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            add_table(doc, rows)
            continue

        if re.match(r"^\d+\.\s", stripped):
            add_bullet(doc, re.sub(r"^\d+\.\s+", "", stripped), ordered=True)
            i += 1
            continue

        if stripped.startswith("- "):
            add_bullet(doc, stripped[2:].strip())
            i += 1
            continue

        # metaregels zoals **Projecttitel:** ... staan al op de cover
        if re.match(r"^\*\*(Projecttitel|Waardenetwerk|Projectperiode|Aan|Onderwerp):\*\*", stripped):
            if stripped.startswith("**Projecttitel:**"):
                i += 1
                continue
            add_para(doc, stripped, size=10, color=MUTED, after=3)
            i += 1
            continue

        if not first_para_done and stripped.startswith("**") and stripped.endswith("**") is False:
            pass

        add_para(doc, stripped)
        first_para_done = True
        i += 1

    doc.save(out_path)
    return out_path


if __name__ == "__main__":
    for spec in DOCS:
        print(build(spec))
