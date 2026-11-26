/**
 * SafeSteps Lab Report File Validation & Byte (Magic Number) Verification
 *
 * Verifies file authenticity by directly inspecting the file's binary header
 * (magic numbers) to prevent file extension spoofing or malicious MIME headers.
 * Permitted formats: PDF, JPEG, PNG. Max size: 5 MB.
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type SupportedFileType = "application/pdf" | "image/jpeg" | "image/png";

export interface FileValidationResult {
  valid: boolean;
  mimeType: SupportedFileType | null;
  error?: string;
}

/**
 * Validates a file buffer using binary magic numbers and size checks.
 */
export function validateReportFileBytes(
  buffer: Buffer | Uint8Array,
  reportedName?: string
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      mimeType: null,
      error: "The uploaded file is empty. Please select a valid document.",
    };
  }

  // 1. File size check (max 5 MB)
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      mimeType: null,
      error: `File is larger than 5 MB (${sizeMb} MB). To keep processing fast and safe, individual uploads are limited to 5 MB per document.`,
    };
  }

  // 2. Binary Magic Number Inspection
  // Need at least 4 bytes to check headers
  if (buffer.length < 4) {
    return {
      valid: false,
      mimeType: null,
      error: "The file appears damaged or incomplete. Please upload a clear photo or PDF.",
    };
  }

  // PNG Magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: "image/png" };
  }

  // JPEG / JPG Magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: "image/jpeg" };
  }

  // PDF Magic bytes: 25 50 44 46 (%PDF)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, mimeType: "application/pdf" };
  }

  // Rejected - Not a supported type
  const filename = reportedName ? ` "${reportedName}"` : "";
  return {
    valid: false,
    mimeType: null,
    error: `This file type isn't supported. Please upload your report${filename} as a PDF, JPG, or PNG document, or paste the text instead.`,
  };
}
