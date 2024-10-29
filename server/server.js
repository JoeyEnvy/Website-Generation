const express = require('express');
const OpenAI = require('openai');
const path = require('path');
const fileProcessor = require('./services/fileProcessor');
require('dotenv').config();

const app = express();
const express = require('express');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/generated-sites', express.static('generated-sites'));


// Main website generation endpoint
app.post('/generate-website', async (req, res) => {
    try {
        const formData = req.body;
        
        // Generate prompt based on form data
        const prompt = generatePrompt(formData);

        // Get response from OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a website generator. Generate HTML, CSS, and JavaScript code based on the following requirements. Separate your response into sections marked with ##HTML##, ##CSS##, and ##JAVASCRIPT##"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        });

        // Process AI response
        const files = await fileProcessor.parseAIResponse(response.choices[0].message.content);
        
        // Create project structure
        const projectPath = await fileProcessor.createProjectStructure(files);

        res.json({
            success: true,
            files,
            projectPath,
            downloadUrl: `/download/${path.basename(projectPath)}`
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate website',
            details: error.message 
        });
    }
});

// Download endpoint
app.get('/download/:projectId', (req, res) => {
    const projectPath = path.join(__dirname, '../generated-sites', req.params.projectId);
    res.download(projectPath);
});

function generatePrompt(formData) {
    return `
        Create a ${formData.websiteType} website with the following specifications:
        - Business Name: ${formData.businessName}
        - Business Type: ${formData.businessType}
        - Description: ${formData.businessDescription}
        - Pages: ${formData.pages.join(', ')}
        - Features: ${formData.features.join(', ')}
        - Style: ${formData.stylePreference}
        
        Include:
        1. Responsive design
        2. Modern UI/UX principles
        3. SEO-friendly structure
        4. ${formData.features.includes('booking') ? 'Booking system' : ''}
        5. ${formData.features.includes('newsletter') ? 'Newsletter signup' : ''}
    `;
}

// In server/server.js
app.post('/test-generation', async (req, res) => {
    try {
        const testData = req.body;
        
        // Test OpenAI connection
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a website generator. Generate HTML, CSS, and JavaScript code based on these requirements:"
                },
                {
                    role: "user",
                    content: JSON.stringify(testData)
                }
            ]
        });

        // Test file generation
        const timestamp = Date.now();
        const testDir = path.join(__dirname, '../generated-sites', `test_${timestamp}`);
        
        await fs.mkdir(testDir, { recursive: true });
        await fs.writeFile(
            path.join(testDir, 'test-response.json'), 
            JSON.stringify(response.choices[0].message.content, null, 2)
        );

        res.json({
            success: true,
            message: 'Test successful',
            directory: testDir,
            response: response.choices[0].message.content
        });
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});