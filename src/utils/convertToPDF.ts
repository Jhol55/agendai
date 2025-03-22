import { jsPDF } from "jspdf";

export async function convertJSONToPDF({ title, data }: { title: string, data: object[] }): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica");
      doc.setFontSize(16);
      doc.text(title, 105, 20, { align: "center" });

      let yOffset = 30; 
      data.forEach((item, index) => {
        doc.setFontSize(14);
        doc.text(`Item ${index + 1}`, 20, yOffset);
        yOffset += 8;

        Object.entries(item).forEach(([key, value]) => {
          doc.setFontSize(12);
          doc.text(`${key}: ${value}`, 25, yOffset);
          yOffset += 6;
        });

        yOffset += 8;
      });

      const pdfArrayBuffer = doc.output("arraybuffer");

      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

      const fileName = `${title.replace(/\s+/g, '_')}_dados.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      resolve(pdfFile); 
    } catch (error) {
      reject(error);
    }
  });
}
