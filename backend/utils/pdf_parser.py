import fitz# PyMuPDF
import re

def extract_text_from_pdf(file_path):
    """Extract raw text from a PDF."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def split_by_sections(text):
    # More flexible section patterns (with optional numbering and punctuation)
    section_titles = [
        "abstract", "introduction", "literature review", "background",
        "methodology", "methods", "method", "findings", "materials and methods", 
        "results", "discussion", "results and discussion", 
        "conclusion", "conclusions", "references", "acknowledgments"
    ]

    # Use regex to match section headers with optional leading numbers
    pattern = r"(?i)(?<=\n)(\d{0,2}\.?\s*)?(" + "|".join(section_titles) + r")\b.*?\n"

    matches = list(re.finditer(pattern, text))
    sections = {}

    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        title = match.group(0).strip().lower()
        content = text[start:end].strip()
        sections[title] = content

    return sections
