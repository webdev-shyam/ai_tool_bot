const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

class PDFService {
  async textToPDF(text, filename = 'document.pdf') {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      // Get the standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      
      // Set margins
      const margin = 50;
      const maxWidth = page.getWidth() - (margin * 2);
      const maxHeight = page.getHeight() - (margin * 2);
      
      // Split text into lines
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Draw text on page
      let y = page.getHeight() - margin;
      let currentPage = page;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if we need a new page
        if (y < margin + lineHeight) {
          currentPage = pdfDoc.addPage([595.28, 841.89]);
          y = page.getHeight() - margin;
        }
        
        currentPage.drawText(line, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        y -= lineHeight;
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      return {
        success: true,
        buffer: Buffer.from(pdfBytes),
        filename: filename,
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: 'Failed to generate PDF.',
      };
    }
  }

  async mergePDFs(pdfBuffers, filename = 'merged.pdf') {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      
      return {
        success: true,
        buffer: Buffer.from(mergedPdfBytes),
        filename: filename,
      };
    } catch (error) {
      console.error('PDF merge error:', error);
      return {
        success: false,
        error: 'Failed to merge PDFs.',
      };
    }
  }
}

module.exports = new PDFService();
