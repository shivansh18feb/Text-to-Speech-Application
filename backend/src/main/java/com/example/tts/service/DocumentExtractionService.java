package com.example.tts.service;

import com.example.tts.exception.InvalidRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class DocumentExtractionService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentExtractionService.class);
    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("The uploaded file is empty. Please select a valid document.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidRequestException("File exceeds maximum allowed size of 15 MB.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.contains(".")) {
            throw new InvalidRequestException("Invalid file: Missing file extension.");
        }

        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase(Locale.ROOT);

        try {
            return switch (extension) {
                case "txt" -> extractFromTxt(file);
                case "pdf" -> extractFromPdf(file);
                case "docx" -> extractFromDocx(file);
                default -> throw new InvalidRequestException("Unsupported file type '." + extension + "'. Only .txt, .pdf, and .docx are supported.");
            };
        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to extract text from file '{}'", filename, e);
            throw new InvalidRequestException("Unable to read or parse document: " + e.getMessage() + ". Ensure the file is not corrupted or password-protected.");
        }
    }

    private String extractFromTxt(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        String text = new String(bytes, StandardCharsets.UTF_8);
        return cleanExtractedText(text);
    }

    private String extractFromPdf(MultipartFile file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new InvalidRequestException("Encrypted or password-protected PDFs are not supported.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return cleanExtractedText(text);
        }
    }

    private String extractFromDocx(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            return cleanExtractedText(text);
        }
    }

    private String cleanExtractedText(String text) {
        if (text == null || text.isBlank()) {
            throw new InvalidRequestException("No readable text found in the uploaded document.");
        }
        // Normalize whitespace and remove unprintable control chars
        String cleaned = text.replaceAll("[\\r\\t]+", " ")
                .replaceAll("[\n]{3,}", "\n\n")
                .trim();

        if (cleaned.isEmpty()) {
            throw new InvalidRequestException("Document contains only blank or unreadable characters.");
        }
        return cleaned;
    }
}
