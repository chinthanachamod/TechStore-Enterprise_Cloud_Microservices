package com.techstore.media.controller;

import com.techstore.media.service.GcsStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/media")
public class MediaController {

    private final GcsStorageService storageService;

    public MediaController(GcsStorageService storageService) {
        this.storageService = storageService;
    }

    // POST /media/upload — upload the files
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        try {
            Map<String, String> result = storageService.uploadFile(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    // GET /media/files — list bucket files
    @GetMapping("/files")
    public ResponseEntity<List<Map<String, String>>> listFiles() {
        return ResponseEntity.ok(storageService.listFiles());
    }

    // DELETE /media/files/{fileName} — delete files
    @DeleteMapping("/files/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        boolean deleted = storageService.deleteFile(fileName);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "File deleted: " + fileName));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "File not found: " + fileName));
        }
    }

    // GET /media/health — health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "Media Service is running",
                "bucket", storageService.getBucketName()
        ));
    }
}
