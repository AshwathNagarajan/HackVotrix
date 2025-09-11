import os
import io
import base64
from typing import Dict, Any
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-GUI backend
import matplotlib.pyplot as plt
import seaborn as sns


def generate_risk_heatmap_image(patient_id: str, risks: Dict[str, float]) -> Dict[str, Any]:
	# Prepare data
	categories = list(risks.keys())
	values = np.array(list(risks.values()), dtype=float)
	values = np.clip(values, 0.0, 1.0)
	matrix = values.reshape(1, -1)

	fig, ax = plt.subplots(figsize=(max(6, len(categories) * 0.6), 2.5))
	sns.heatmap(matrix, annot=True, cmap="Reds", cbar=True, vmin=0, vmax=1, xticklabels=categories, yticklabels=["Risk"])
	plt.xticks(rotation=45, ha="right")
	plt.tight_layout()

	# Save to static path
	static_dir = os.path.join(os.path.dirname(__file__), "..", "static", "heatmaps")
	os.makedirs(static_dir, exist_ok=True)
	file_name = f"heatmap_{patient_id}.png"
	file_path = os.path.abspath(os.path.join(static_dir, file_name))
	fig.savefig(file_path, dpi=150)
	plt.close(fig)

	# Also return base64
	with open(file_path, "rb") as f:
		b64 = base64.b64encode(f.read()).decode("utf-8")

	return {
		"path": file_path,
		"url": f"/static/heatmaps/{file_name}",
		"base64": b64,
	}
