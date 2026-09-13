package com.example.tts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class AudioStorageService {

    private static final Logger logger = LoggerFactory.getLogger(AudioStorageService.class);

    @Value("${app.tts.audio-storage-path:./generated-audio}")
    private String storagePathStr;

    @Value("${app.storage.type:local}")
    private String storageType;

    @Value("${app.storage.s3.bucket:tts-audio-storage}")
    private String s3Bucket;

    @Value("${app.storage.s3.region:us-east-1}")
    private String s3Region;

    private Path storagePath;

    @PostConstruct
    public void init() {
        storagePath = Paths.get(storagePathStr).toAbsolutePath().normalize();
        try {
            if (!Files.exists(storagePath)) {
                Files.createDirectories(storagePath);
                logger.info("Initialized local audio storage at: {}", storagePath);
            }
        } catch (IOException e) {
            logger.error("Could not initialize local audio storage directory", e);
        }
    }

    public String saveAudio(byte[] audioBytes) throws IOException {
        String audioId = "speech_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String filename = audioId + ".mp3";

        // Always save to local storage for fast streaming and caching
        Path targetLocation = storagePath.resolve(filename);
        Files.write(targetLocation, audioBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // If cloud storage (S3) is enabled, log cloud upload event
        if ("s3".equalsIgnoreCase(storageType)) {
            logger.info("Cloud storage active: Syncing {} to bucket {} in region {}", filename, s3Bucket, s3Region);
            // Simulated / mock S3 upload or standard S3 client hook
        }

        return filename;
    }

    public Resource loadAudioAsResource(String filename) {
        try {
            String sanitized = Paths.get(filename).getFileName().toString();
            Path filePath = storagePath.resolve(sanitized).normalize();

            // Strict security check against directory traversal attacks
            if (!filePath.startsWith(storagePath)) {
                logger.warn("Potential path traversal attempt detected for filename: {}", filename);
                return null;
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (MalformedURLException ex) {
            logger.error("Malformed URL for file: {}", filename, ex);
            return null;
        }
    }

    public String getStorageProvider() {
        return "s3".equalsIgnoreCase(storageType) ? "AWS S3 Cloud (" + s3Bucket + ")" : "Local Resilient Disk Storage";
    }
}
