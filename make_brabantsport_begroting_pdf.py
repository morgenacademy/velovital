from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUT = "output/pdf/Velo_Vital_BrabantSport_begroting.pdf"

ORANGE = colors.HexColor("#FF803B")
PURPLE = colors.HexColor("#8000FF")
PINK = colors.HexColor("#FF35AA")
DEEP = colors.HexColor("#442F66")
LILAC = colors.HexColor("#FAF4FF")
PEACH = colors.HexColor("#FFF4EC")
GRID = colors.HexColor("#E5D9F7")


def money(value):
    return f"EUR {value:,.0f}".replace(",", ".")


costs = [
    ("Brabant-brede marketingcampagne rond Den Bosch, Breda, Eindhoven en Tilburg", 5000),
    ("Content, vormgeving, fotografie/video en deelnemersverhalen", 3000),
    ("Regionale kennismakingsritten en community-activatie", 3500),
    ("Fietschecks, onderhoud en rijklaar maken leenfietsen", 3000),
    ("Deelnemer-startpakketten en herkenbaar basismateriaal", 2000),
    ("Aanmeldproces, intake en praktische deelnemersondersteuning", 2000),
    ("Lokale partneractivatie en promotionele ondersteuning", 2500),
    ("Monitoring, evaluatie en impactrapportage", 1000),
    ("Inzet fietsenmaker: fietsen, onderhoud en expertise in natura", 3000),
    ("Vrijwilligersinzet community en begeleiding in natura", 2000),
    ("Eigen inzet Velo Vital: organisatie, afstemming en communitybeheer", 3000),
]

income = [
    ("Gevraagde bijdrage BrabantSport Fonds", 15000),
    ("Eigen inzet Velo Vital", 3000),
    ("Bijdrage fietsenmaker in natura", 3000),
    ("Vrijwilligersinzet in natura", 2000),
    ("Partnerbijdragen in natura: bereik, promotie, locaties en netwerk", 4000),
    ("Deelnemersbijdragen, communitybijdragen en overige dekking", 3000),
]

assert sum(v for _, v in costs) == 30000
assert sum(v for _, v in income) == 30000

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="TitleVelo",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=23,
        alignment=TA_CENTER,
        textColor=PURPLE,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="SubtitleVelo",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        textColor=PINK,
        spaceAfter=14,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyVelo",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.4,
        leading=10.5,
        textColor=DEEP,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        name="H2Velo",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=13,
        textColor=PURPLE,
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="SmallRight",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        alignment=TA_RIGHT,
        textColor=DEEP,
    )
)
styles.add(
    ParagraphStyle(
        name="Cell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.0,
        leading=9.6,
        textColor=DEEP,
    )
)
styles.add(
    ParagraphStyle(
        name="CellBold",
        parent=styles["Cell"],
        fontName="Helvetica-Bold",
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="Amount",
        parent=styles["Cell"],
        alignment=TA_RIGHT,
    )
)
styles.add(
    ParagraphStyle(
        name="AmountBold",
        parent=styles["Amount"],
        fontName="Helvetica-Bold",
    )
)


def as_table(title_left, title_right, rows, total_label, width_left, width_right):
    data = [
        [Paragraph(title_left, styles["CellBold"]), Paragraph(title_right, styles["CellBold"])]
    ]
    for label, value in rows:
        data.append([Paragraph(label, styles["Cell"]), Paragraph(money(value), styles["Amount"])])
    data.append(
        [
            Paragraph(f"<b>{total_label}</b>", styles["Cell"]),
            Paragraph(f"<b>{money(sum(v for _, v in rows))}</b>", styles["AmountBold"]),
        ]
    )
    table = Table(data, colWidths=[width_left * cm, width_right * cm], hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6),
        ("BACKGROUND", (0, 1), (-1, -2), colors.white),
        ("BACKGROUND", (0, -1), (-1, -1), PEACH),
        ("LINEABOVE", (0, -1), (-1, -1), 1.0, PINK),
    ]
    for row_idx in range(1, len(data) - 1):
        if row_idx % 2 == 0:
            style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), LILAC))
    table.setStyle(TableStyle(style))
    return table


doc = SimpleDocTemplate(
    OUT,
    pagesize=landscape(A4),
    rightMargin=1.25 * cm,
    leftMargin=1.25 * cm,
    topMargin=1.05 * cm,
    bottomMargin=1.0 * cm,
)

story = []
story.append(Paragraph("Velo Vital Brabant", styles["TitleVelo"]))
story.append(Paragraph("Begroting BrabantSport Fonds - Leenfiets & Community Programma", styles["SubtitleVelo"]))

summary = [
    [Paragraph("<b>Projectperiode</b>", styles["Cell"]), Paragraph("September 2026 - februari 2027", styles["Cell"])],
    [Paragraph("<b>Projectgebied</b>", styles["Cell"]), Paragraph("Noord-Brabant, rondom Den Bosch, Breda, Eindhoven en Tilburg", styles["Cell"])],
    [Paragraph("<b>Gevraagde bijdrage</b>", styles["Cell"]), Paragraph("<b>EUR 15.000</b>", styles["AmountBold"])],
    [Paragraph("<b>Totale projectwaarde</b>", styles["Cell"]), Paragraph("<b>EUR 30.000</b>", styles["AmountBold"])],
    [Paragraph("<b>Cofinanciering</b>", styles["Cell"]), Paragraph("<b>EUR 15.000 - 50%</b>", styles["AmountBold"])],
]
summary_table = Table(summary, colWidths=[5.2 * cm, 19.2 * cm], hAlign="LEFT")
summary_table.setStyle(
    TableStyle(
        [
            ("GRID", (0, 0), (-1, -1), 0.5, GRID),
            ("BACKGROUND", (0, 0), (0, -1), PEACH),
            ("BACKGROUND", (1, 0), (1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 3.8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.8),
        ]
    )
)
story.append(summary_table)
story.append(Spacer(1, 5))

story.append(
    Paragraph(
        "Sluitende begroting. De bijdrage van BrabantSport wordt ingezet voor zichtbare projectactiviteiten: "
        "Brabant-brede marketing, deelnemerswerving, content, kennismakingsritten, fietschecks, instapmateriaal "
        "en praktische deelnemersondersteuning. Cofinanciering bestaat uit eigen inzet, partnerbijdragen, "
        "vrijwilligersinzet en bijdragen in natura.",
        styles["BodyVelo"],
    )
)

cost_block = [
    [Paragraph("Kosten", styles["H2Velo"])],
    [as_table("Kostenpost", "Bedrag", costs, "Totale projectkosten", 14.2, 2.8)],
]
income_block = [
    [Paragraph("Dekking", styles["H2Velo"])],
    [as_table("Dekking", "Bedrag", income, "Totale dekking", 6.9, 2.8)],
]
two_cols = Table(
    [[Table(cost_block, colWidths=[17.0 * cm]), Table(income_block, colWidths=[9.7 * cm])]],
    colWidths=[17.4 * cm, 10.1 * cm],
    hAlign="LEFT",
)
two_cols.setStyle(
    TableStyle(
        [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]
    )
)
story.append(two_cols)
story.append(Spacer(1, 5))
story.append(
    Paragraph(
        "Toelichting: de gevraagde bijdrage bedraagt exact 50% van de totale projectwaarde. De kosten voor aanleg of "
        "aanschaf van infrastructuur/hardware zijn niet opgenomen. Materiaalposten zijn beperkt tot praktische "
        "deelnemersondersteuning, fietschecks, onderhoud en herkenbaar basismateriaal voor deelname.",
        styles["BodyVelo"],
    )
)

doc.build(story)
print(OUT)
