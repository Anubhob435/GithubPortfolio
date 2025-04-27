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

if __name__ == '__main__':
    app.run(debug=True)
