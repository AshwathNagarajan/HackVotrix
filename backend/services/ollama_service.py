import os
from typing import List, Dict, Any
import httpx
from datetime import datetime
from services.heatmap_service import generate_risk_heatmap_image

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")


async def _ollama_chat(prompt: str) -> str:
	payload = {"model": MODEL, "prompt": prompt, "stream": False}
	async with httpx.AsyncClient(timeout=60) as client:
		resp = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
		resp.raise_for_status()
		data = resp.json()
		return data.get("response", "")


async def analyze_reports_grouped_by_date(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	# Group by report_date (YYYY-MM-DD)
	groups: Dict[str, List[Dict[str, Any]]] = {}
	for r in reports:
		rd = r.get("report_date")
		if isinstance(rd, str):
			try:
				rd_dt = datetime.fromisoformat(rd.replace("Z", "+00:00"))
			except Exception:
				rd_dt = None
		else:
			rd_dt = rd
		key = (rd_dt.date().isoformat() if rd_dt else "unknown")
		groups.setdefault(key, []).append({"id": str(r.get("_id")), "type": r.get("metadata", {}).get("type"), "summary": r.get("report_text", "")[:300]})
	return {"groups": groups}


async def analyze_risk_heatmap(patient_id: str, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	# Build concise prompt for risk extraction
	joined = "\n\n".join([f"[Report {i+1} on {str(r.get('report_date'))}]\n{r.get('report_text','')[:2000]}" for i, r in enumerate(reports)])
	prompt = (
		"You are a clinical risk analyst. From the patient's reports, output JSON with normalized risk scores (0-1) for categories: "
		"cardiac, diabetes, respiratory, renal, hepatic, neurological, oncological, musculoskeletal."
		"If unknown, use 0.2. Only return JSON.\n\nReports:\n" + joined
	)
	resp = await _ollama_chat(prompt)
	# naive JSON parse fallback
	import json
	try:
		parsed = json.loads(resp)
	except Exception:
		parsed = {"cardiac": 0.3, "diabetes": 0.3, "respiratory": 0.3, "renal": 0.3, "hepatic": 0.3, "neurological": 0.3, "oncological": 0.3, "musculoskeletal": 0.3}
	img = generate_risk_heatmap_image(patient_id, parsed)
	return {"risks": parsed, "heatmap": img}


async def analyze_symptom_with_history(patient_id: str, symptom: str, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	joined = "\n\n".join([f"[{str(r.get('report_date'))}]\n{r.get('report_text','')[:1200]}" for r in reports])
	prompt = (
		"Given the historical clinical notes, analyze the likely root causes for the new symptom. "
		"Provide a short explanation and reference which prior report dates support it. "
		"Return JSON: { explanation: string, references: [date strings] }.\n\n"
		f"Symptom: {symptom}\n\nHistory:\n{joined}"
	)
	resp = await _ollama_chat(prompt)
	import json
	try:
		parsed = json.loads(resp)
	except Exception:
		parsed = {"explanation": resp.strip()[:800], "references": []}
	return parsed


async def chat_with_history(patient_id: str, message: str, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
	context = "\n\n".join([f"[{str(r.get('report_date'))}] {r.get('report_text','')[:800]}" for r in reports])
	prompt = (
		"You are a helpful medical AI assistant. Use patient context below to answer succinctly and safely.\n"
		"If uncertain, say so.\n\nContext:\n" + context + "\n\nUser: " + message + "\nAssistant:"
	)
	resp = await _ollama_chat(prompt)
	return {"reply": resp.strip()}
