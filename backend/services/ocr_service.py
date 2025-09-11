from datetime import datetime
from typing import Tuple, Optional
import os
import io
import pytesseract
import cv2
import numpy as np
from PIL import Image


async def extract_text_and_date_from_image(upload_file) -> Tuple[str, Optional[datetime]]:
	content = await upload_file.read()
	# Preprocess with OpenCV
	image = Image.open(io.BytesIO(content)).convert("RGB")
	np_img = np.array(image)
	gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
	gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

	tess_cmd = os.getenv("TESSERACT_CMD", "")
	if tess_cmd:
		pytesseract.pytesseract.tesseract_cmd = tess_cmd

	text = pytesseract.image_to_string(gray)
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
