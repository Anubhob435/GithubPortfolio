from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from datetime import datetime
from dotenv import load_dotenv
import uuid
from pymongo import MongoClient

load_dotenv()

# MongoDB setup
try:
    client = MongoClient(os.getenv('MONGODB_URI'), serverSelectionTimeoutMS=3000)
    db = client['chatbot_db']
    conversations = db['conversations']
except Exception:
    conversations = None

app = Flask(__name__)


class GeminiChat:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.api_available = bool(self.api_key)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        self.headers = {
            'x-goog-api-key': self.api_key,
            'Content-Type': 'application/json'
        } if self.api_available else None

        self.system_prompt = """You are Anubhob's AI assistant on his portfolio website. Be helpful, friendly, and concise.

ABOUT ANUBHOB DEY:
- Data Engineer for AI Model Training at Legal Gini (Remote, Jan 2025 – Present)
- B.Tech CSE (AI & ML) at University of Engineering & Management (UEM), Kolkata — CGPA 8.43, graduating 2026
- Based in Kolkata, West Bengal, India

PROJECTS:
1. TrackBeez — Real-time GPS tracking for school bus safety (Google Cloud, React, Node.js, TensorFlow) — 40ms latency, 50+ users
2. Automated Web Scraping Pipeline — AI-powered data collection with reCAPTCHA bypass (Python, Selenium, Scrapy, BeautifulSoup) — 99.9% uptime
3. MidPay — Blockchain escrow payment system with RSA-2048 encryption (Python, Flask, REST API)
4. IPL Match Predictor — ML-based match prediction with 85% accuracy (scikit-learn, XGBoost, Pandas, Gemini AI)

SKILLS:
- Languages: Python, Java, C, JavaScript, SQL
- ML/AI: TensorFlow, scikit-learn, Computer Vision, OpenCV
- Web: React, Flask, Node.js, HTML/CSS, RESTful APIs
- Databases: MongoDB, MySQL, Oracle
- Cloud: Google Cloud, Azure, AWS S3, Docker
- Other: Git, Automation, Data Pipeline Design, System Architecture

CERTIFICATIONS: Harvard CS50x, Harvard CS50p, Udemy Web Dev Bootcamp, LinkedIn Java OOP

CONTACT: anubhob435@gmail.com | +91 8583005957 | LinkedIn: /in/anubhob-dey-05702714b/ | GitHub: /Anubhob435

Keep responses conversational and focused on Anubhob's profile. If asked about unrelated topics, gently redirect."""

    def get_response(self, message):
        if not self.api_available:
            return None
        try:
            payload = {
                "contents": [{
                    "parts": [{"text": f"{self.system_prompt}\n\nUser: {message}"}]
                }]
            }
            resp = requests.post(self.base_url, headers=self.headers, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts and 'text' in parts[0]:
                        return parts[0]['text'].strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
        return None


gemini = GeminiChat()

FALLBACK_RESPONSES = {
    'greeting': [
        "Hello! I'm Anubhob's AI assistant. Ask me about his skills, projects, or experience!",
        "Hi there! Welcome to Anubhob's portfolio. What would you like to know?",
    ],
    'projects': [
        "Anubhob's key projects: TrackBeez (GPS tracking), AI Web Scraping Pipeline, MidPay (blockchain escrow), and IPL Predictor (85% ML accuracy). Check the Projects section for details!",
    ],
    'skills': [
        "Tech stack: Python, Java, JS, React, Flask, Node.js, TensorFlow, Docker, GCP, Azure, AWS, MongoDB, MySQL. Full breakdown in the Skills section!",
    ],
    'contact': [
        "Reach Anubhob at anubhob435@gmail.com | +91 8583005957 | LinkedIn: /in/anubhob-dey-05702714b/ | GitHub: /Anubhob435",
    ],
    'education': [
        "B.Tech CSE (AI & ML) at UEM Kolkata, CGPA 8.43, graduating 2026. Plus Harvard CS50x, CS50p, and more certifications!",
    ],
    'experience': [
        "Currently Data Engineer at Legal Gini (Jan 2025–Present) — building data pipelines, web scrapers, and AWS S3 integrations for AI model training.",
    ],
}


def get_fallback(message):
    msg = message.lower()
    if any(w in msg for w in ['hello', 'hi', 'hey']):
        cat = 'greeting'
    elif any(w in msg for w in ['project', 'trackbeez', 'ipl', 'midpay', 'scraping']):
        cat = 'projects'
    elif any(w in msg for w in ['skill', 'tech', 'python', 'react', 'flask']):
        cat = 'skills'
    elif any(w in msg for w in ['contact', 'email', 'phone', 'linkedin']):
        cat = 'contact'
    elif any(w in msg for w in ['education', 'university', 'uem', 'cs50']):
        cat = 'education'
    elif any(w in msg for w in ['experience', 'job', 'legal gini', 'work']):
        cat = 'experience'
    else:
        return "I can tell you about Anubhob's projects, skills, education, experience, or contact info. What interests you?"
    responses = FALLBACK_RESPONSES[cat]
    return responses[hash(message) % len(responses)]


@app.route('/')
def index():
    return render_template('index.html', year=datetime.now().year)


@app.route('/get_projects')
def get_projects():
    try:
        resp = requests.get('https://api.github.com/users/Anubhob435/repos', timeout=10)
        if resp.status_code == 200:
            repos = resp.json()
            projects = [{
                'name': r['name'],
                'description': r['description'] or 'No description available',
                'url': r['html_url'],
                'stars': r['stargazers_count'],
                'language': r['language'],
                'updated_at': r['updated_at'],
            } for r in repos if not r['fork']]
            return jsonify(projects)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'error': 'Failed to fetch repositories'}), 500


@app.route('/github_stats')
def github_stats():
    username = 'Anubhob435'
    try:
        # Fetch user profile for public_repos count
        user_resp = requests.get(f'https://api.github.com/users/{username}', timeout=10)
        repos_count = 0
        if user_resp.status_code == 200:
            repos_count = user_resp.json().get('public_repos', 0)

        # Fetch all repos to sum stars
        total_stars = 0
        page = 1
        while True:
            repos_resp = requests.get(
                f'https://api.github.com/users/{username}/repos?per_page=100&page={page}',
                timeout=10
            )
            if repos_resp.status_code != 200:
                break
            repos = repos_resp.json()
            if not repos:
                break
            total_stars += sum(r.get('stargazers_count', 0) for r in repos)
            page += 1

        # Fetch contributions from GitHub contributions API
        total_contribs = 0
        try:
            contrib_resp = requests.get(
                f'https://github-contributions-api.jogruber.de/v4/{username}?y=last',
                timeout=10
            )
            if contrib_resp.status_code == 200:
                contrib_data = contrib_resp.json()
                total_contribs = contrib_data.get('total', {}).get('last', 0)
        except Exception:
            total_contribs = 0

        return jsonify({
            'repos': repos_count,
            'stars': total_stars,
            'contributions': total_contribs
        })
    except Exception as e:
        return jsonify({'repos': 0, 'stars': 0, 'contributions': 0})


@app.route('/submit_form', methods=['POST'])
def submit_form():
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')
    if not all([name, email, message]):
        return jsonify({'success': False, 'message': 'All fields are required.'})
    return jsonify({'success': True, 'message': 'Message sent! I\'ll get back to you soon.'})


@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip()
    if not user_message:
        return jsonify({'response': 'Please ask me something about Anubhob!'})

    session_id = request.json.get('session_id', str(uuid.uuid4()))

    bot_response = gemini.get_response(user_message) or get_fallback(user_message)

    # Log to MongoDB
    if conversations is not None:
        try:
            conversations.insert_one({
                'session_id': session_id,
                'ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
                'user_message': user_message,
                'bot_response': bot_response,
                'source': 'gemini' if gemini.get_response(user_message) else 'fallback',
                'timestamp': datetime.utcnow(),
            })
        except Exception:
            pass

    return jsonify({'response': bot_response, 'session_id': session_id})


if __name__ == '__main__':
    app.run(debug=True)
