const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/generate-pdf', async (req, res) => {
    try {
        const { template, name, location } = req.body;
        
        console.log(`Generating PDF for: ${name}, ${location} using ${template}`);
        
        // Load selected template
        const templatePath = path.join(__dirname, template);
        const templateBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        
        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        // Get pages
        const pages = pdfDoc.getPages();
        const page1 = pages[0];
        const page3 = pages[2];
        
        const { height } = page1.getSize();
        
        // Template-specific positioning
        let nameX, nameY, locationX, locationY, page3NameX, page3NameY;
        
        if (template === 'template1.pdf') {
            // Template 1 positions
            nameX = 700;
            nameY = height - 1600;
            locationX = 950;
            locationY = height - 1750;
            page3NameX = 650;
            page3NameY = height - 550;
        } else if (template === 'template2.pdf') {
            // Template 2 positions (adjust these for your second template)
            nameX = 700;
            nameY = height - 1600;
            locationX = 950;
            locationY = height - 1750;
            page3NameX = 650;
            page3NameY = height - 550;
        }
        
        // Add text to page 1 - Name
        page1.drawText(name, {
            x: nameX,
            y: nameY,
            size: 50,
            font: font,
            color: rgb(0.5, 0, 0)  // Maroon color
        });
        
        // Add text to page 1 - Location
        page1.drawText(location, {
            x: locationX,
            y: locationY,
            size: 50,
            font: font,
            color: rgb(0.5, 0, 0)  // Maroon color
        });
        
        // Add text to page 3 - Name
        page3.drawText(name, {
            x: page3NameX,
            y: page3NameY,
            size: 50,
            font: font,
            color: rgb(0.5, 0, 0)  // Maroon color
        });
        
        // Save
        const pdfBytes = await pdfDoc.save();
        
        // Send
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invitation_${name}.pdf`);
        res.send(Buffer.from(pdfBytes));
        
        console.log('✓ Success!');
        
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).send('Error: ' + error.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running at http://localhost:3000');
});
