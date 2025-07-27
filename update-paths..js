const fs = require('fs');
const path = require('path');

console.log('🚀 Starting path update process...');

// Path mappings - what to replace
const pathMappings = {
    // Images
    '../assets/images/sehatsari.png': '../assets/images/../assets/images/sehatsari.png',
    'href="../assets/images/sehatsari.png"': 'href="../assets/images/../assets/images/sehatsari.png"',
    'src="../assets/images/sehatsari.png"': 'src="../assets/images/../assets/images/sehatsari.png"',
    
    // CSS Files
    'href="../css/styles.css"': 'href="../css/styles.css"',
    'href="navbar-style.css"': 'href="../css/navbar-style.css"',
    'href="logo.css"': 'href="../css/logo.css"',
    
    // JavaScript Files
    'src="../js/script.js"': 'src="../js/script.js"',
    'src="../js/navbar-loader.js"': 'src="../js/navbar-loader.js"',
    'src="../js/timer-with-music.js"': 'src="../js/timer-with-music.js"',
    'src="../js/video-handler.js"': 'src="../js/video-handler.js"',
    'src="../js/quiz.js"': 'src="../js/quiz.js"',
    'src="../js/timer.js"': 'src="../js/timer.js"',
    
    // Audio Files
    'src="../assets/audio/brush-song.mp3"': 'src="../assets/audio/brush-song.mp3"',
    'src="../assets/audio/brush-song.ogg"': 'src="../assets/audio/brush-song.ogg"',
    'src="../assets/audio/timer-end.mp3"': 'src="../assets/audio/timer-end.mp3"',
    'src="../assets/audio/timer-end.ogg"': 'src="../assets/audio/timer-end.ogg"',
    
    // Audio source tags
    '<source src="../assets/audio/brush-song.mp3"': '<source src="../assets/audio/brush-song.mp3"',
    '<source src="../assets/audio/brush-song.ogg"': '<source src="../assets/audio/brush-song.ogg"',
    '<source src="../assets/audio/timer-end.mp3"': '<source src="../assets/audio/timer-end.mp3"',
    '<source src="../assets/audio/timer-end.ogg"': '<source src="../assets/audio/timer-end.ogg"'
};

// Function to update file content
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        let changeCount = 0;
        
        for (const [oldPath, newPath] of Object.entries(pathMappings)) {
            const regex = new RegExp(escapeRegExp(oldPath), 'g');
            const matches = content.match(regex);
            
            if (matches) {
                content = content.replace(regex, newPath);
                updated = true;
                changeCount += matches.length;
                console.log(`  🔄 Replaced "${oldPath}" → "${newPath}" (${matches.length} times)`);
            }
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath} (${changeCount} changes)`);
            return true;
        } else {
            console.log(`ℹ️  No changes needed: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if folders exist and create them if needed
function ensureFoldersExist() {
    const folders = [
        './assets',
        './assets/images',
        './assets/audio',
        './css',
        './js',
        './pages'
    ];
    
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`📁 Created folder: ${folder}`);
        }
    });
}

// Main execution
function main() {
    console.log('📁 Checking folder structure...');
    ensureFoldersExist();
    
    console.log('\n🔍 Looking for HTML files to update...');
    
    let updatedFiles = 0;
    let totalFiles = 0;
    
    // Get all HTML files in current directory
    const currentDirFiles = fs.readdirSync('./')
        .filter(file => file.endsWith('.html'));
    
    // Update files in current directory
    currentDirFiles.forEach(file => {
        console.log(`\n📄 Processing: ${file}`);
        totalFiles++;
        if (updateFile(file)) {
            updatedFiles++;
        }
    });
    
    // Update files in pages directory if it exists
    if (fs.existsSync('./pages')) {
        const pagesFiles = fs.readdirSync('./pages')
            .filter(file => file.endsWith('.html'));
        
        pagesFiles.forEach(file => {
            const filePath = path.join('./pages', file);
            console.log(`\n📄 Processing: ${filePath}`);
            totalFiles++;
            if (updateFile(filePath)) {
                updatedFiles++;
            }
        });
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Path update completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Total files processed: ${totalFiles}`);
    console.log(`   • Files updated: ${updatedFiles}`);
    console.log(`   • Files unchanged: ${totalFiles - updatedFiles}`);
    
    if (updatedFiles > 0) {
        console.log('\n✅ Don\'t forget to:');
        console.log('   1. Move your files to the new folder structure');
        console.log('   2. Test your website to make sure all links work');
        console.log('   3. Check that all images, CSS, and JS files load correctly');
    }
    
    console.log('\n🚀 Ready to go!');
}

// Run the script
main();