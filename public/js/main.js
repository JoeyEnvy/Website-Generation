// WebsiteGenerator class handles all the main functionality of the website generator
class WebsiteGenerator {
    constructor() {
        // Get references to important DOM elements
        this.form = document.getElementById('websiteGeneratorForm');
        this.previewFrame = document.getElementById('previewFrame');
        
        // Initialize variables for page navigation
        this.currentPage = 0;
        this.generatedPages = [];
        
        // Set up event listeners
        this.initializeEventListeners();
    }

    // Set up all necessary event listeners
    initializeEventListeners() {
        // Listen for form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Update preview in real-time as user types (with a 1-second delay)
        this.form.addEventListener('input', debounce(() => {
            this.updatePreview();
        }, 1000));

        // Listen for clicks on device preview buttons (mobile, tablet, desktop)
        document.querySelectorAll('.preview-controls button').forEach(button => {
            button.addEventListener('click', () => {
                this.changePreviewDevice(button.id.replace('Preview', ''));
            });
        });

        // Listen for clicks on page navigation buttons
        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));
    }

    // Handle form submission
    async handleSubmit(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        
        // Validate the form before proceeding
        if (!this.validateForm()) {
            return;
        }

        this.showLoading(); // Show loading indicator

        try {
            // Collect form data and generate AI query
            const formData = new FormData(this.form);
            const aiQuery = this.generateAIQuery(formData);
            
            // Send request to server to generate website
            const response = await fetch('/generate-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: aiQuery })
            });

            const data = await response.json();
            
            if (data.success) {
                // If successful, update preview, show download button, create GitHub repo
                this.generatedPages = data.pages;
                this.updatePreview();
                this.showDownloadButton(data.downloadUrl);
                this.createGitHubRepo(data.files);
                this.showSuccess('Website generated successfully!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Failed to generate website: ' + error.message);
        } finally {
            this.hideLoading(); // Hide loading indicator
        }
    }

    // Generate AI query based on form data
generateAIQuery(formData) {
    const websiteType = formData.get('websiteType');
    const pageCount = formData.get('pageCount');
    const pages = Array.from(formData.getAll('pages')).join(', ');
    const businessName = formData.get('businessName');
    const businessDescription = formData.get('businessDescription');
    const features = Array.from(formData.getAll('features')).join(', ');
    const colorScheme = formData.get('colorScheme');
    const fontStyle = formData.get('fontStyle');
    const layoutPreference = formData.get('layoutPreference');

    return `I would like you to print me the HTML, CSS, and JavaScript all in one HTML document and print multiple pages if I say I need them. Listen to the following: I would like a ${websiteType} website with ${pageCount} pages which will be a ${pages} page(s) and my business needs to be called '${businessName}'. Some information to bear in mind and include would be '${businessDescription}'. If possible, please include these extra features: ${features}. For the design, please use a ${colorScheme} color scheme, a ${fontStyle} font style, and a ${layoutPreference} layout. Please be as detailed as possible and ensure to include images collected from the internet and a professional sleek look and as aesthetic as you can.`;
}



    // Update the preview with generated content
    updatePreview() {
        if (this.generatedPages.length === 0) return;

        const currentPageContent = this.generatedPages[this.currentPage];
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        this.previewFrame.innerHTML = '';
        this.previewFrame.appendChild(iframe);

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(currentPageContent);
        iframe.contentWindow.document.close();

        this.updatePageNavigation();
    }

    // Update page navigation buttons and indicator
    updatePageNavigation() {
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageIndicator = document.getElementById('pageIndicator');

        prevButton.disabled = this.currentPage === 0;
        nextButton.disabled = this.currentPage === this.generatedPages.length - 1;
        pageIndicator.textContent = `Page ${this.currentPage + 1} of ${this.generatedPages.length}`;
    }

    // Change the current page being previewed
    changePage(direction) {
        this.currentPage += direction;
        this.currentPage = Math.max(0, Math.min(this.currentPage, this.generatedPages.length - 1));
        this.updatePreview();
    }

    // Create a GitHub repository with the generated files
    async createGitHubRepo(files) {
        try {
            const response = await fetch('/create-github-repo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ files })
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess(`GitHub repository created: ${data.repoUrl}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Failed to create GitHub repository: ' + error.message);
        }
    }

    // Change the preview device (mobile, tablet, desktop)
    changePreviewDevice(device) {
        const sizes = {
            mobile: '375px',
            tablet: '768px',
            desktop: '100%'
        };

        const iframe = this.previewFrame.querySelector('iframe');
        if (iframe) {
            iframe.style.width = sizes[device];
        }

        // Update active button
        document.querySelectorAll('.preview-controls button').forEach(button => {
            button.classList.toggle('active', button.id === `${device}Preview`);
        });
    }

    // Show loading indicator
    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = 'Generating website...';
        this.form.appendChild(loader);
        this.form.querySelector('button[type="submit"]').disabled = true;
    }

    // Hide loading indicator
    hideLoading() {
        const loader = this.form.querySelector('.loader');
        if (loader) loader.remove();
        this.form.querySelector('button[type="submit"]').disabled = false;
    }

    // Show download button for generated website
    showDownloadButton(downloadUrl) {
        const downloadButton = document.createElement('a');
        downloadButton.href = downloadUrl;
        downloadButton.className = 'btn btn-success';
        downloadButton.innerHTML = 'Download Generated Website';
        downloadButton.download = true;
        
        const container = document.createElement('div');
        container.className = 'download-container';
        container.appendChild(downloadButton);
        
        this.previewFrame.parentNode.insertBefore(container, this.previewFrame.nextSibling);
    }

    // Show success message
    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    // Show error message
    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.innerHTML = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    // Validate the form
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        return isValid;
    }

    // Show error for a specific form field
    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.innerHTML = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    // Clear error for a specific form field
    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        field.classList.remove('error');
    }
}

// Utility function for debouncing (delaying) function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to test the website generation
async function testGeneration() {
    const testResult = document.getElementById('testResult');
    testResult.innerHTML = 'Testing...';

    try {
        const form = document.getElementById('websiteGeneratorForm');
        const formData = new FormData(form);
        const generator = new WebsiteGenerator();
        let aiQuery = generator.generateAIQuery(formData);
        let fullResponse = '';
        let isComplete = false;
        let continuationCount = 0;
        const maxContinuations = 5; // Limit on how many times to ask for continuation

        while (!isComplete && continuationCount < maxContinuations) {
            console.log('Current AI Query:', aiQuery); // Log current query for debugging

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer sk-svcacct-my9RsR8w9C-bohxPXQ399JWIa_hkrCxBR13BiDtAmwgCzztgQhgOCLw6fA-3EBDlwmC4qET3BlbkFJ7hMrPabTE019iK7v6SI4EZm_NoaIwkYBW0poJCFopSW37fDu0p6opGE8-Mw7e0slwNhVEA`
                },
                body: JSON.stringify({
                    model: "gpt-4", // Use "gpt-4" or "gpt-3.5-turbo"
                    messages: [
                        { role: "system", content: "You are a helpful assistant that generates HTML, CSS, and JavaScript for websites based on user input." },
                        { role: "user", content: aiQuery }
                    ],
                    max_tokens: 2000, // Adjust based on expected response size
                    temperature: 0.7 // Adjust for creativity
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            fullResponse += data.choices[0].message.content; // Append the generated content

            // Check if the response indicates completion
            if (fullResponse.toLowerCase().includes("that's all of the code") || 
                fullResponse.includes('</html>') && 
                fullResponse.includes('</style>') && 
                fullResponse.includes('</script>')) {
                isComplete = true;
            } else {
                aiQuery = "Please continue providing any remaining HTML, CSS, or JavaScript code.";
                continuationCount++;
            }
        }

        if (!isComplete) {
            console.warn('Max continuations reached without complete response.');
        }

        testResult.innerHTML = `Test successful! Check console for details.`;
        console.log('Full OpenAI Response:', fullResponse);

    } catch (error) {
        console.error('Error during test generation:', error);
        testResult.innerHTML = `Error: ${error.message}. Check console for more details.`;
    }
}




// Initialize the WebsiteGenerator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteGenerator();
});
