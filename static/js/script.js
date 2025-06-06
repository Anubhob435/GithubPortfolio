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
}