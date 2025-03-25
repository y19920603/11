import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseLangFile(filePath) {
  const fileData = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileData, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return json;
}

function generateLangTsFiles(data, outputDir) {
  const headers = data[0];

  headers.slice(2).forEach((header, index) => {
    const langObj = {};
    for (let i = 1; i < data.length; i++) {
      const module = data[i][0];
      const name = data[i][1];
      const key = `${module}_${name}`;
      const value = data[i][index + 2];
      langObj[key] = value;
    }

    const langTsPath = path.join(outputDir, `${header}.ts`);

    let langTsContent = `export default {`;

    Object.keys(langObj).forEach((key) => {
      langTsContent += `\n  ${key}: "${langObj[key]}",`;
    });

    langTsContent += `\n};\n`;

    fs.writeFileSync(langTsPath, langTsContent, "utf-8");
    console.log(`生成语言 TypeScript 文件: ${langTsPath}`);
  });
}

function convertLangExcelToTs() {
  const inputFilePath = path.resolve(__dirname, "lang.xlsx");
  const outputDir = path.resolve(__dirname, "package");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const data = parseLangFile(inputFilePath);
  generateLangTsFiles(data, outputDir);
}

convertLangExcelToTs();
