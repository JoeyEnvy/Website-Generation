// fileProcessor.jsconst fs = require('fs').promises;
const path = require('path');

class FileProcessor {
    async parseAIResponse(aiResponse) {
        const files = {
            html: '',
            css: '',
            js: ''
        };

        // Extract code sections
        const htmlMatch = aiResponse.match(/##HTML##([\s\S]*?)(?=##CSS##|$)/);
        const cssMatch = aiResponse.match(/##CSS##([\s\S]*?)(?=##JAVASCRIPT##|$)/);
        const jsMatch = aiResponse.match(/##JAVASCRIPT##([\s\S]*?)$/);

        if (htmlMatch) files.html = this.cleanCode(htmlMatch[1]);
        if (cssMatch) files.css = this.cleanCode(cssMatch[1]);
        if (jsMatch) files.js = this.cleanCode(jsMatch[1]);

        return files;
    }

    async createProjectStructure(files) {
        const timestamp = Date.now();
        const projectDir = path.join(__dirname, '../../generated-sites', `website_${timestamp}`);
        
        try {
            // Create directories
            await fs.mkdir(projectDir, { recursive: true });
            await fs.mkdir(path.join(projectDir, 'css'));
            await fs.mkdir(path.join(projectDir, 'js'));

            // Write files
            await Promise.all([
                fs.writeFile(path.join(projectDir, 'index.html'), files.html),
                fs.writeFile(path.join(projectDir, 'css/styles.css'), files.css),
                fs.writeFile(path.join(projectDir, 'js/main.js'), files.js)
            ]);

            return projectDir;
        } catch (error) {
            console.error('Error creating project structure:', error);
            throw error;
        }
    }

    cleanCode(code) {
        return code
            .replace(/```[a-z]*/g, '') // Remove code block markers
            .trim();
    }
}

module.exports = new FileProcessor();
const fs = require('fs').promises;
const path = require('path');

class FileProcessor {
    async parseAIResponse(aiResponse) {
        const files = {
            html: [],
            css: [],
            js: []
        };

        // Parse AI response and separate into different file types
        const sections = aiResponse.split('##');
        sections.forEach(section => {
            if (section.includes('HTML')) {
                files.html.push(this.extractCode(section));
            } else if (section.includes('CSS')) {
                files.css.push(this.extractCode(section));
            } else if (section.includes('JavaScript')) {
                files.js.push(this.extractCode(section));
            }
        });

        return files;
    }

    async createProjectStructure(files) {
        const projectDir = path.join(__dirname, '../generated-sites', Date.now().toString());
        
        // Create directories
        await fs.mkdir(projectDir, { recursive: true });
        await fs.mkdir(path.join(projectDir, 'css'));
        await fs.mkdir(path.join(projectDir, 'js'));

        // Write files
        await Promise.all([
            fs.writeFile(path.join(projectDir, 'index.html'), files.html.join('\n')),
            fs.writeFile(path.join(projectDir, 'css/styles.css'), files.css.join('\n')),
            fs.writeFile(path.join(projectDir, 'js/main.js'), files.js.join('\n'))
        ]);

        return projectDir;
    }

    extractCode(section) {
        // Extract code from section
        const codeMatch = section.match(/```[\s\S]+?```/);
        if (codeMatch) {
            return codeMatch[0].replace(/```/g, '').trim();
        }
        return '';
    }
}

module.exports = new FileProcessor();