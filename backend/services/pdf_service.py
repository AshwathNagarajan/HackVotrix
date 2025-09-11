from datetime import datetime
from typing import Tuple, Optional
import io
import pdfplumber


async def extract_text_and_date_from_pdf(upload_file) -> Tuple[str, Optional[datetime]]:
	content = await upload_file.read()
	text = ""
	with pdfplumber.open(io.BytesIO(content)) as pdf:
		for page in pdf.pages:
			text += page.extract_text() or ""
	report_date = _parse_date_from_text(text)
	return text.strip(), report_date


def _parse_date_from_text(text: str) -> Optional[datetime]:
	import re
	from dateutil import parser as dateparser
	candidates = re.findall(r"\b(\d{1,2}[\-/ ]\d{1,2}[\-/ ]\d{2,4}|\d{4}[\-/ ]\d{1,2}[\-/ ]\d{1,2})\b", text)
	for c in candidates:
		try:
			return dateparser.parse(c, dayfirst=False, fuzzy=True)
		except Exception:
			continue
	return None
