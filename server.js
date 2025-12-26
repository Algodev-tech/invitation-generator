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

    // Load selected template PDF
    const templatePath = path.join(__dirname, template);
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes); // load existing PDF [web:255]

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get pages
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page3 = pages[2];
    const { width, height } = page1.getSize(); // get page size [web:232]

    // ================================
    // COORDINATES YOU CAN TUNE
    // Keep x between 0–width, y between 0–height.
    // Increase x -> right, increase y -> up. [web:237][web:263]

    // Name on page 1 (first time)
    const name1X = 180;          // change as you like
    const name1Y = height - 435; // change as you like

    // Name on page 3 (second time)
    const name2X = 180;          // change as you like
    const name2Y = height - 150; // change as you like

    // Location on page 1
    const locationX = 250;          // change as you like
    const locationY = height - 470; // change as you like
    // ================================

    // Draw name on page 1
    page1.drawText(name, {
      x: name1X,
      y: name1Y,
      size: 18,
      font,
      color: rgb(0.5, 0, 0),
    });

    // Draw location on page 1
    page1.drawText(location, {
      x: locationX,
      y: locationY,
      size: 18,
      font,
      color: rgb(0.5, 0, 0),
    });

    // Draw same name again on page 3
    page3.drawText(name, {
      x: name2X,
      y: name2Y,
      size: 18,
      font,
      color: rgb(0.5, 0, 0),
    });

    // Save updated PDF
    const pdfBytes = await pdfDoc.save(); // serialize PDF [web:255]

    // Send file to browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Invitation_${name}.pdf`
    );
    res.send(Buffer.from(pdfBytes));

    console.log('✓ PDF generated successfully');
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send('Error: ' + error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:3000');
});
