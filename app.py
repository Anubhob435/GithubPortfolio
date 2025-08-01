from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from datetime import datetime

app = Flask(__name__)

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
    user_message = request.json.get('message', '').lower()
    
    # Enhanced bot responses with more context about Anubhob
    responses = {
        'greeting': [
            "Hello! I'm Anubhob's AI assistant. I can help you learn about his skills, projects, and experience. What would you like to know?",
            "Hi there! Welcome to Anubhob's portfolio. Feel free to ask me about his technical background, projects, or how to get in touch!",
            "Hey! I'm here to help you navigate through Anubhob's portfolio. Ask me anything about his work!"
        ],
        'projects': [
            "Anubhob has several impressive projects: 🚀 IPL Predictor (ML-based cricket match prediction), 💳 Midpay (digital payment solution), and 📊 TrackBeez (data tracking application). Each showcases different technical skills!",
            "His portfolio includes machine learning projects, web applications, and data analysis tools. The Projects section has detailed information about each one with live demos and GitHub links!",
            "Notable projects include an AI pipeline for data processing, various ML models, and full-stack web applications. Check out the Projects section for technical details!"
        ],
        'skills': [
            "Anubhob's technical arsenal includes: 🐍 Python, 🤖 Machine Learning (scikit-learn, TensorFlow), 🌐 Web Development (Flask, Django, HTML/CSS/JS), 📊 Data Analysis (pandas, numpy), and ☁️ Cloud technologies!",
            "He's proficient in multiple programming languages, ML frameworks, database management, and has experience with both frontend and backend development. The Skills section breaks this down by category!",
            "His expertise spans across Data Science, Web Development, Machine Learning, and Software Engineering with hands-on experience in various projects and certifications."
        ],
        'contact': [
            "📧 Email: anubhob435@gmail.com | 💼 LinkedIn: /in/anubhob-dey-05702714b/ | 🐙 GitHub: /Anubhob435 | You can also use the contact form on this page!",
            "Anubhob is always open to collaboration and new opportunities! You can reach him through email, LinkedIn, or the contact form in the Contact section.",
            "Feel free to connect! He's active on GitHub and LinkedIn, and responds quickly to emails. Perfect for discussing projects, opportunities, or just tech in general!"
        ],
        'education': [
            "🎓 Anubhob studied at the University of Engineering & Management (UEM), where he built a strong foundation in computer science and engineering. Check the Education section for more details!",
            "His academic background at UEM provided him with theoretical knowledge that he's successfully applied in practical projects and professional work.",
            "University of Engineering & Management graduate with a focus on computer science. His education combined with self-learning has shaped his diverse skill set."
        ],
        'experience': [
            "Anubhob has hands-on experience in ML model development, web application creation, data analysis, and software engineering. His projects demonstrate real-world application of his skills!",
            "His experience includes building end-to-end ML pipelines, developing responsive web applications, working with APIs, and implementing data-driven solutions.",
            "From machine learning algorithms to full-stack development, Anubhob has worked across the entire technology stack with a focus on practical, scalable solutions."
        ],
        'resume': [
            "📄 You can download Anubhob's complete resume using the 'Download Resume' button in the header or at the bottom of the page. It includes detailed information about his experience, projects, and skills!",
            "The resume contains comprehensive details about his technical expertise, project implementations, and professional background. Look for the download button!",
            "His CV showcases all projects, technical skills, certifications, and contact information in a professional format. Perfect for understanding his complete profile!"
        ]
    }
    
    # Determine response category
    category = 'default'
    
    if any(word in user_message for word in ['hello', 'hi', 'hey', 'greetings']):
        category = 'greeting'
    elif any(word in user_message for word in ['project', 'work', 'portfolio', 'ipl', 'midpay', 'trackbeez']):
        category = 'projects'
    elif any(word in user_message for word in ['skill', 'technology', 'programming', 'language', 'python', 'ml', 'web']):
        category = 'skills'
    elif any(word in user_message for word in ['contact', 'email', 'reach', 'connect', 'linkedin', 'github']):
        category = 'contact'
    elif any(word in user_message for word in ['education', 'study', 'university', 'degree', 'uem']):
        category = 'education'
    elif any(word in user_message for word in ['experience', 'background', 'career', 'work']):
        category = 'experience'
    elif any(word in user_message for word in ['resume', 'cv', 'download']):
        category = 'resume'
    else:
        # Default responses
        default_responses = [
            "That's interesting! I can help you learn about Anubhob's projects, technical skills, education, experience, or how to contact him. What would you like to know more about?",
            "Feel free to ask me about: 🚀 Projects, 💻 Technical Skills, 🎓 Education, 💼 Experience, or 📞 Contact Information. I'm here to help!",
            "I'd love to help! Try asking about his machine learning projects, web development work, programming skills, or how to get in touch with him.",
            "You can ask me about specific projects like the IPL Predictor, his technical expertise, educational background, or the best way to contact him!"
        ]
        return jsonify({'response': default_responses[hash(user_message) % len(default_responses)]})
    
    # Return response from appropriate category
    category_responses = responses[category]
    response = category_responses[hash(user_message) % len(category_responses)]
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
