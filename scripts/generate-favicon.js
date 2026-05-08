import sharp from "sharp";
import fs from "fs";
import path from "path";

const input = "src/assets/images/logo.png";
const output = "public/favicon.ico";

async function generate() {
    try {
        if (!fs.existsSync(input)) {
            console.error(`Input file not found: ${input}`);
            return;
        }

        // sharp doesn't export to .ico directly, 
        // but modern browsers support PNG renamed to .ico 
        // or we just output as a 32x32 PNG for best compatibility
        await sharp(input)
            .resize(32, 32)
            .toFile(output);
        
        console.log(`Favicon generated: ${output}`);
    } catch (err) {
        console.error("Error generating favicon:", err);
    }
}

generate();