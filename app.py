from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

class GeminiChat:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("⚠️ Warning: GEMINI_API_KEY not found. Falling back to predefined responses.")
            self.api_available = False
        else:
            self.api_available = True
            
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        self.headers = {
            'x-goog-api-key': self.api_key,
            'Content-Type': 'application/json'
        } if self.api_available else None
        
        # Portfolio context for better responses
        self.system_prompt = """You are Anubhob's AI assistant on his portfolio website. You should provide helpful, friendly, and informative responses about Anubhob Dey and his work. Here's what you should know about him:

ABOUT ANUBHOB:
- Data Engineer currently working on AI model training at Legal Gini (Remote, Jan 2025 - Present)
- Graduate from University of Engineering & Management (UEM)
- Specializes in Python, Machine Learning, Web Development, and Data Engineering

KEY PROJECTS:
1. TrackBeez - GPS tracking system for school bus safety with real-time monitoring
2. Automated Web Scraping Pipeline - AI-powered data collection with reCAPTCHA bypass
3. MidPay - Blockchain-based escrow payment system with RSA encryption
4. IPL Match Predictor - ML-based cricket match outcome prediction with 85% accuracy

TECHNICAL SKILLS:
- Languages: Python, Java, C, JavaScript, SQL
- ML/AI: TensorFlow, scikit-learn, Computer Vision, OpenCV
- Web: React, Flask, Node.js, HTML/CSS, RESTful APIs
- Databases: MongoDB, MySQL, Oracle
- Cloud: Google Cloud, Azure, AWS S3, Docker
- Other: Git, Automation, Data Pipeline Design, System Architecture

CERTIFICATIONS:
- Harvard CS50x: Introduction to Computer Science
- Harvard CS50p: Python Programming
- Udemy Web Development Bootcamp
- LinkedIn Java OOP

CONTACT:
- Email: anubhob435@gmail.com
- LinkedIn: /in/anubhob-dey-05702714b/
- GitHub: /Anubhob435
- Phone: +91 8583005957
- Location: Kolkata, West Bengal, India

Keep responses conversational, helpful, and focused on Anubhob's professional profile. If asked about something not related to Anubhob or his work, politely redirect the conversation back to his portfolio."""

    def get_gemini_response(self, user_message):
        """Get response from Gemini API"""
        if not self.api_available:
            return None
            
        try:
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{self.system_prompt}\n\nUser: {user_message}"}
                        ]
                    }
                ]
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data and len(data['candidates']) > 0:
                    candidate = data['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content']:
                        parts = candidate['content']['parts']
                        if len(parts) > 0 and 'text' in parts[0]:
                            return parts[0]['text'].strip()
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            
        return None

# Initialize Gemini chat
gemini_chat = GeminiChat()

@app.route('/')
def index():
    return render_template('index.html', year=datetime.now().year)

@app.route('/submit_form', methods=['POST'])
def submit_form():
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')
    
    # Here you would typically save this to a database or send an email
    # For now, we'll just return a success message
    return jsonify({'success': True, 'message': 'Form submitted successfully!'})

@app.route('/get_projects')
def get_projects():
    # Replace with your GitHub username
    username = 'Anubhob435'
    
    # GitHub API to fetch user repositories
    url = f'https://api.github.com/users/{username}/repos'
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            repos = response.json()
            # Filter out relevant information
            projects = []
            for repo in repos:
                if not repo['fork']:  # Exclude forked repositories
                    projects.append({
                        'name': repo['name'],
                        'description': repo['description'] or 'No description available',
                        'url': repo['html_url'],
                        'stars': repo['stargazers_count'],
                        'language': repo['language']
                    })
            return jsonify(projects)
        else:
            return jsonify({'error': 'Failed to fetch repositories'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip()
    
    if not user_message:
        return jsonify({'response': 'Please ask me something about Anubhob!'})
    
    # Try to get Gemini response first
    gemini_response = gemini_chat.get_gemini_response(user_message)
    
    if gemini_response:
        return jsonify({'response': gemini_response})
    
    # Fallback to predefined responses if Gemini is unavailable
    user_message_lower = user_message.lower()
    
    # Enhanced bot responses with more context about Anubhob
    responses = {
        'greeting': [
            "Hello! I'm Anubhob's AI assistant. I can help you learn about his skills, projects, and experience. What would you like to know?",
            "Hi there! Welcome to Anubhob's portfolio. Feel free to ask me about his technical background, projects, or how to get in touch!",
            "Hey! I'm here to help you navigate through Anubhob's portfolio. Ask me anything about his work!"
        ],
        'projects': [
            "Anubhob has several impressive projects: 🚀 TrackBeez (GPS tracking for school buses), 🤖 AI Web Scraping Pipeline, 💳 MidPay (blockchain escrow system), and 🏏 IPL Predictor (85% accuracy ML model). Each showcases different technical skills!",
            "His notable projects include real-time GPS tracking systems, AI-powered data pipelines, blockchain payment solutions, and machine learning prediction models. Check out the Projects section for detailed technical information!",
            "From ML algorithms to full-stack applications, Anubhob's projects demonstrate expertise in Python, TensorFlow, React, blockchain, and cloud technologies. Each project solves real-world problems!"
        ],
        'skills': [
            "Anubhob's technical stack: 🐍 Python, 🤖 ML (TensorFlow, scikit-learn), 🌐 Web Dev (React, Flask, Node.js), 📊 Data Engineering, ☁️ Cloud (GCP, Azure, AWS), and 🔗 Blockchain. Plus Java, C, JavaScript, and multiple databases!",
            "He excels in full-stack development, machine learning, data pipeline design, computer vision, automation, and system architecture. His skills span from low-level programming to AI integration!",
            "Core expertise includes Python automation, ML model development, web applications, database design (MongoDB, MySQL), cloud deployment, and API development. Check the Skills section for the complete breakdown!"
        ],
        'contact': [
            "📧 anubhob435@gmail.com | 📱 +91 8583005957 | 💼 LinkedIn: /in/anubhob-dey-05702714b/ | 🐙 GitHub: /Anubhob435 | 📍 Kolkata, India (UTC+5:30). You can also use the contact form below!",
            "Anubhob is actively seeking new opportunities and collaborations! Best to reach him via email (responds quickly) or LinkedIn. He's open to discussing projects, freelance work, or just tech conversations!",
            "Available for projects starting May 2025. Connect through email, LinkedIn, or GitHub. He specializes in web applications, data engineering, AI integration, and process automation!"
        ],
        'education': [
            "🎓 University of Engineering & Management (UEM) graduate with computer science focus. Enhanced his education with Harvard CS50x, CS50p Python certification, Udemy Web Dev Bootcamp, and LinkedIn Java OOP certification!",
            "Strong academic foundation from UEM combined with continuous learning through prestigious online courses. His education spans theoretical CS concepts to practical implementation skills!",
            "UEM provided the foundation, but Anubhob's self-directed learning through Harvard, Udemy, and hands-on projects shaped his diverse technical expertise across multiple domains!"
        ],
        'experience': [
            "Currently Data Engineer for AI Model Training at Legal Gini (Jan 2025-Present). Works on data pipelines, web scraping automation, AWS S3 integration, and parallel processing for AI model development!",
            "Professional experience in ML model development, full-stack web applications, data analysis, and automation. His projects demonstrate real-world application across multiple technology stacks!",
            "From university projects to professional data engineering role, Anubhob has built end-to-end solutions including GPS tracking systems, payment platforms, prediction models, and data pipelines!"
        ],
        'resume': [
            "📄 Download Anubhob's complete resume using the 'Download Resume' button! It contains detailed project descriptions, technical skills, certifications, and contact information in professional format!",
            "His CV showcases all major projects, technical expertise, work experience at Legal Gini, educational background, and certifications. Perfect for understanding his complete professional profile!",
            "The resume includes project metrics (like 85% ML accuracy, 40ms latency), technology stacks, and achievements. Use the download button in the header or contact section!"
        ]
    }
    
    # Determine response category
    category = 'default'
    
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        category = 'greeting'
    elif any(word in user_message_lower for word in ['project', 'work', 'portfolio', 'trackbeez', 'ipl', 'midpay', 'scraping']):
        category = 'projects'
    elif any(word in user_message_lower for word in ['skill', 'technology', 'programming', 'language', 'python', 'ml', 'web', 'react', 'flask']):
        category = 'skills'
    elif any(word in user_message_lower for word in ['contact', 'email', 'reach', 'connect', 'linkedin', 'github', 'phone']):
        category = 'contact'
    elif any(word in user_message_lower for word in ['education', 'study', 'university', 'degree', 'uem', 'harvard', 'cs50']):
        category = 'education'
    elif any(word in user_message_lower for word in ['experience', 'background', 'career', 'work', 'job', 'legal', 'gini']):
        category = 'experience'
    elif any(word in user_message_lower for word in ['resume', 'cv', 'download']):
        category = 'resume'
    else:
        # Default responses
        default_responses = [
            "I can help you learn about Anubhob's projects, technical skills, education, experience, or contact information. What interests you most?",
            "Feel free to ask about: 🚀 Projects (TrackBeez, IPL Predictor, MidPay), 💻 Technical Skills, 🎓 Education, 💼 Work Experience, or 📞 How to Contact him!",
            "I'd love to help! Try asking about his machine learning projects, web development work, data engineering experience, or the best way to get in touch!",
            "You can ask about specific projects, his technical expertise (Python, ML, Web Dev), educational background (UEM + Harvard courses), or his current role as Data Engineer!"
        ]
        return jsonify({'response': default_responses[hash(user_message) % len(default_responses)]})
    
    # Return response from appropriate category
    category_responses = responses[category]
    response = category_responses[hash(user_message) % len(category_responses)]
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
