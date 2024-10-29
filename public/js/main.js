class WebsiteGenerator {
    constructor() {
        this.form = document.getElementById('websiteGeneratorForm');
        this.previewFrame = document.getElementById('previewFrame');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time preview updates
        this.form.addEventListener('input', debounce(() => {
            this.updatePreview();
        }, 1000));

        // Device preview buttons
        document.querySelectorAll('.preview-controls button').forEach(button => {
            button.addEventListener('click', () => {
                this.changePreviewDevice(button.id.replace('Preview', ''));
            });
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.showLoading();

        try {
            const formData = new FormData(this.form);
            const response = await fetch('/generate-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const data = await response.json();
            
            if (data.success) {
                this.updatePreview(data.files);
                this.showDownloadButton(data.downloadUrl);
                this.showSuccess('Website generated successfully!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Failed to generate website: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

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

    updatePreview(files) {
        if (!files) return;

        const previewDocument = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${files.css}</style>
            </head>
            <body>
                ${files.html}
                <script>${files.js}</script>
            </body>
            </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        this.previewFrame.innerHTML = '';
        this.previewFrame.appendChild(iframe);

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(previewDocument);
        iframe.contentWindow.document.close();
    }

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

    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = 'Generating website...';
        this.form.appendChild(loader);
        this.form.querySelector('button[type="submit"]').disabled = true;
    }

    hideLoading() {
        const loader = this.form.querySelector('.loader');
        if (loader) loader.remove();
        this.form.querySelector('button[type="submit"]').disabled = false;
    }

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

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.innerHTML = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.innerHTML = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        field.classList.remove('error');
    }
}

// Utility function for debouncing
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

// In public/js/main.js
async function testGeneration() {
    const testResult = document.getElementById('testResult');
    testResult.innerHTML = 'Testing...';

    try {
        const response = await fetch('/test-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                websiteType: 'test',
                businessName: 'Test Business',
                description: 'This is a test'
            })
        });

        const data = await response.json();
        testResult.innerHTML = `Test successful! Check console for details.`;
        console.log('Generated files:', data);
    } catch (error) {
        testResult.innerHTML = `Error: ${error.message}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteGenerator();
});