import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

try:
    load_dotenv()
except UnicodeDecodeError:
    # some editors save .env as UTF-16/UTF-16LE; retry with that encoding
    load_dotenv(encoding="utf-16")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})

# Configure Gemini with your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.route("/recommendations", methods=["POST"])
def get_recommendations():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        health_data = data.get("healthData", {})

        prompt = f"""
        Based on the following health data, provide 5 short and actionable personalized health recommendations. And make it dynamic each time
        Health data: {health_data}
        Keep each recommendation under 25 words.
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        text = response.text
        # Split into a list of recommendations
        recommendations = [
            line.strip(" -") for line in text.split("\n") if line.strip()
        ]

        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print("Error:", e)
        # fallback recommendations
        return jsonify({
            "recommendations": [
                "Drink at least 8 glasses of water daily.",
                "Get 7–8 hours of sleep for recovery.",
                "Include fruits and vegetables in every meal."
            ],
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
