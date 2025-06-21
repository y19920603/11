import PdfAPI from "@/api/pdf.api";

export default function downloadPDFUtil(url: string, data: object, fileName: string) {
  PdfAPI.DownloadPDF(`/report${url}`, data)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const disposition = response.headers["content-disposition"];
      let filename = `${fileName}.pdf`;

      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
        if (utf8Match?.[1]) {
          filename = decodeURIComponent(utf8Match[1]);
        } else {
          const asciiMatch = disposition.match(/filename="?([^"]+)"?/);
          if (asciiMatch?.[1]) {
            filename = asciiMatch[1];
          }
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename); // 動態設置文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("下載 PDF 失敗：", error);
    });
}
