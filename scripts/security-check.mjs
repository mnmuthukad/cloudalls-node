import { sanitizeLegalHtml } from "../dist/services/content.service.js";

const input = '<h2>Policy</h2><p class="lead" onclick="alert(1)">Safe copy <strong>kept</strong></p><script>alert(1)</script><a href="javascript:alert(1)" style="color:red">unsafe</a><a href="https://example.com" target="_blank">safe link</a>';
const output = sanitizeLegalHtml(input);

if (output.includes("<script") || output.includes("onclick") || output.includes("javascript:") || output.includes("style=")) {
  throw new Error(`Unsafe legal markup survived sanitization: ${output}`);
}
if (!output.includes("<h2>Policy</h2>") || !output.includes("<strong>kept</strong>") || !output.includes('href="https://example.com"')) {
  throw new Error(`Expected safe policy markup was removed: ${output}`);
}
console.log("LEGAL_SANITIZER_OK");
