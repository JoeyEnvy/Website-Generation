// test-generation.js in your project root
const fs = require('fs').promises;
const path = require('path');

async function testFileGeneration() {
    try {
        const testContent = {
            html: '<h1>Test Page</h1>',
            css: 'h1 { color: blue; }',
            js: 'console.log("Test");'
        };

        const testDir = path.join(__dirname, 'generated-sites', `test_${Date.now()}`);
        
        await fs.mkdir(testDir, { recursive: true });
        await fs.mkdir(path.join(testDir, 'css'));
        await fs.mkdir(path.join(testDir, 'js'));

        await Promise.all([
            fs.writeFile(path.join(testDir, 'index.html'), testContent.html),
            fs.writeFile(path.join(testDir, 'css/styles.css'), testContent.css),
            fs.writeFile(path.join(testDir, 'js/main.js'), testContent.js)
        ]);

        console.log('Test files generated successfully in:', testDir);
    } catch (error) {
        console.error('File generation test failed:', error);
    }
}

testFileGeneration();