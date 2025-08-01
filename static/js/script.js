// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    // Check for saved theme preference or respect OS settings
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        body.classList.add('dark-mode');
    }
    
    themeToggleBtn.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Typing animation for the home section
    initTypewriter();
    
    // Simulate GitHub stats
    simulateGitHubStats();
      // Resume Button Functionality
    const resumeBtn = document.getElementById('resume-btn');
    // Resume download will now work through the native browser download
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Scroll indicator functionality
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                window.scrollTo({
                    top: aboutSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });

        // Hide scroll indicator on scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });
    }
    
    // Fetch GitHub Projects
    fetchGithubProjects();
      // Tab Navigation for Leadership, Interests & Awards Section
    initTabNavigation();
    
    // Skills Tab Navigation
    initSkillsTabNavigation();
    
    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formResponse = document.getElementById('form-response');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            
            fetch('/submit_form', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                formResponse.textContent = data.message;
                formResponse.className = data.success ? 'success' : 'error';
                formResponse.classList.remove('hidden');
                
                if (data.success) {
                    contactForm.reset();
                    setTimeout(() => {
                        formResponse.classList.add('hidden');
                    }, 5000);
                }
            })
            .catch(error => {
                formResponse.textContent = 'An error occurred. Please try again later.';
                formResponse.className = 'error';
                formResponse.classList.remove('hidden');
            });
        });
    }
    
    // Animate contribution graph cells
    animateContributionGraph();
      // Profile Picture Toggle Functionality
    const profilePicInner = document.querySelector('.profile-pic-inner');
    
    if (profilePicInner) {
        let isClicked = false;
        
        profilePicInner.addEventListener('click', function() {
            isClicked = !isClicked;
            
            if (isClicked) {
                this.classList.add('clicked', 'flipped');
            } else {
                this.classList.remove('clicked', 'flipped');
            }
        });
    }
});

// Typewriter effect function
function initTypewriter() {
    const typingTextElement = document.getElementById('typing-text');
    if (!typingTextElement) return;
    
    const phrases = [
        "Software Developer",
        "Data Engineer",
        "AI Enthusiast",
        "Problem Solver",
        "Web Developer"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // faster when deleting
        } else {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150; // slower when typing
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at the end of typing
            isDeleting = true;
            typingSpeed = 1000; // wait before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Move to the next phrase
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // pause before typing next phrase
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing effect
    setTimeout(type, 1000);
}

// Function to initialize tab navigation
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get target pane and activate it
                const targetId = button.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
}

// Function to simulate GitHub stats with animation
function simulateGitHubStats() {
    const repoCount = document.getElementById('repo-count');
    const contribCount = document.getElementById('contrib-count');
    const starCount = document.getElementById('star-count');
    
    function animateValue(element, start, end, duration) {
        if (!element) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Random values for demo purposes
    const repos = Math.floor(Math.random() * 30) + 15; // 15-45 repos
    const contributions = Math.floor(Math.random() * 700) + 300; // 300-1000 contributions
    const stars = Math.floor(Math.random() * 150) + 50; // 50-200 stars
    
    setTimeout(() => {
        animateValue(repoCount, 0, repos, 1500);
        animateValue(contribCount, 0, contributions, 2000);
        animateValue(starCount, 0, stars, 1800);
    }, 500);
}

// Function to animate contribution graph
function animateContributionGraph() {
    const cells = document.querySelectorAll('.graph-cell');
    
    if (cells.length > 0) {
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.transition = 'background-color 0.5s ease';
                
                const currentLevel = parseInt(cell.className.split('level-')[1]);
                const newLevel = Math.min(currentLevel + 1, 4);
                
                cell.classList.remove(`level-${currentLevel}`);
                cell.classList.add(`level-${newLevel}`);
                
                setTimeout(() => {
                    if (Math.random() > 0.7) {
                        const randomLevel = Math.floor(Math.random() * 5);
                        cell.classList.remove(`level-${newLevel}`);
                        cell.classList.add(`level-${randomLevel}`);
                    }
                }, 2000);
            }, index * 100);
        });
    }
}

// Function to fetch GitHub projects
function fetchGithubProjects() {
    const projectsContainer = document.getElementById('projects-container');
    
    if (!projectsContainer) return;
    
    fetch('/get_projects')
        .then(response => response.json())
        .then(projects => {
            // Clear loading message
            projectsContainer.innerHTML = '';
            
            if (projects.error) {
                projectsContainer.innerHTML = `<div class="error">${projects.error}</div>`;
                return;
            }
            
            if (projects.length === 0) {
                projectsContainer.innerHTML = '<div class="no-projects">No projects found.</div>';
                return;
            }
            
            // Create project cards
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                
                // Generate random fork count and last updated date for demo
                const forkCount = Math.floor(Math.random() * 20);
                const daysAgo = Math.floor(Math.random() * 30) + 1;
                
                projectCard.innerHTML = `
                    <div class="project-content">
                        <div class="project-header">
                            <h3 class="project-title">
                                <i class="far fa-folder"></i> ${project.name}
                            </h3>
                            <span class="project-visibility">${Math.random() > 0.5 ? 'Public' : 'Private'}</span>
                        </div>
                        <p class="project-description">${project.description || 'No description provided'}</p>
                        <div class="project-meta">
                            ${project.language ? `
                                <span class="project-language">
                                    <span class="language-color" style="background-color: ${getLanguageColor(project.language)}"></span>
                                    ${project.language}
                                </span>
                            ` : ''}
                            <div class="project-stats">
                                <span class="project-stars">
                                    <i class="far fa-star"></i> ${project.stars}
                                </span>
                                <span class="project-forks">
                                    <i class="fas fa-code-branch"></i> ${forkCount}
                                </span>
                            </div>
                        </div>
                        <div class="project-footer">
                            <span class="project-updated">Updated ${daysAgo} days ago</span>
                            <a href="${project.url}" class="project-link" target="_blank">View <i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                `;
                
                projectsContainer.appendChild(projectCard);
            });
        })
        .catch(error => {
            projectsContainer.innerHTML = `<div class="error">Failed to load projects. Please try again later.</div>`;
        });
}

// Function to get language color
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#F05138',
        'Kotlin': '#A97BFF'
    };
    
    return colors[language] || '#8b949e'; // Default color
}

// Function to initialize skills tab navigation
function initSkillsTabNavigation() {
    const skillTabButtons = document.querySelectorAll('.skill-tab-btn');
    
    if (skillTabButtons.length > 0) {
        skillTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all skill tab buttons and panes
                document.querySelectorAll('.skill-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.skill-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get target pane and activate it
                const targetId = button.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
    
    // Chat Widget Functionality
    initChatWidget();
}

// Chat Widget Functions
function initChatWidget() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    
    // Toggle chat window
    chatBubble.addEventListener('click', function() {
        chatWindow.classList.add('show');
        chatInput.focus();
    });
    
    // Close chat window
    closeChatBtn.addEventListener('click', function() {
        chatWindow.classList.remove('show');
    });
    
    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (!chatWindow.contains(e.target) && !chatBubble.contains(e.target)) {
            chatWindow.classList.remove('show');
        }
    });
    
    // Send message functionality
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            chatInput.value = '';
            sendMessageBtn.disabled = true;
            
            // Show typing indicator
            addTypingIndicator();
            
            // Send request to Flask backend
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                removeTypingIndicator();
                addMessage(data.response, 'bot');
                sendMessageBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                removeTypingIndicator();
                // Fallback to local response if server is unavailable
                const botResponse = generateBotResponse(message);
                addMessage(botResponse, 'bot');
                sendMessageBtn.disabled = false;
            });
        }
    }
    
    // Send message on button click
    sendMessageBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add message to chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.classList.add('message-content', 'typing');
        typingContent.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Generate bot responses
    function generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Define response patterns
        const responses = {
            greeting: [
                "Hello! I'm here to help you learn more about Anubhob's work and experience.",
                "Hi there! Feel free to ask me anything about Anubhob's projects, skills, or background.",
                "Hey! I'm Anubhob's AI assistant. What would you like to know?"
            ],
            projects: [
                "Anubhob has worked on various projects including ML pipelines, web applications, and data analysis tools. You can check out the Projects section above for detailed information!",
                "His notable projects include IPL predictor, Midpay, and TrackBeez. Each project showcases different aspects of his technical skills.",
                "You can find all of Anubhob's projects in the Projects section. They cover areas like machine learning, web development, and data science."
            ],
            skills: [
                "Anubhob is skilled in Python, Machine Learning, Web Development, Data Analysis, and more. Check out the Skills section for a comprehensive list!",
                "His technical expertise includes programming languages like Python, frameworks like Flask and Django, and ML libraries like scikit-learn and TensorFlow.",
                "You can see all of Anubhob's technical skills organized by category in the Skills section above."
            ],
            contact: [
                "You can reach out to Anubhob via email at anubhob435@gmail.com or connect with him on LinkedIn and GitHub!",
                "Feel free to use the contact form in the Contact section, or reach him directly through his social media links.",
                "Anubhob is always open to discussing new opportunities and collaborations. Use the contact section to get in touch!"
            ],
            education: [
                "Anubhob studied at the University of Engineering & Management. You can find more details in the Education section!",
                "Check out the Education section to learn about Anubhob's academic background and achievements.",
                "His educational journey is detailed in the Education section above."
            ],
            experience: [
                "Anubhob has experience in machine learning, web development, and data analysis. You can see his work experience and projects throughout the portfolio!",
                "His professional experience spans across different domains including AI/ML, web development, and data science.",
                "Check out the various sections to learn about Anubhob's professional journey and technical expertise."
            ],
            default: [
                "That's an interesting question! You can find more information about Anubhob in the different sections of this portfolio.",
                "I'd be happy to help! Try asking about his projects, skills, education, or how to contact him.",
                "Feel free to explore the portfolio sections above, or ask me about Anubhob's projects, skills, or background!",
                "You can ask me about Anubhob's technical skills, projects, education, or how to get in touch with him."
            ]
        };
        
        // Determine response category
        let category = 'default';
        
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            category = 'greeting';
        } else if (message.includes('project') || message.includes('work') || message.includes('portfolio')) {
            category = 'projects';
        } else if (message.includes('skill') || message.includes('technology') || message.includes('programming') || message.includes('language')) {
            category = 'skills';
        } else if (message.includes('contact') || message.includes('email') || message.includes('reach') || message.includes('connect')) {
            category = 'contact';
        } else if (message.includes('education') || message.includes('study') || message.includes('university') || message.includes('degree')) {
            category = 'education';
        } else if (message.includes('experience') || message.includes('background') || message.includes('career')) {
            category = 'experience';
        }
        
        // Return random response from category
        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
}