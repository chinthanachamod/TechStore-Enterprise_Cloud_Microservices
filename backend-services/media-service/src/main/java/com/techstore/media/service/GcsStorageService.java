package com.techstore.media.service;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GcsStorageService {

    private final Storage storage;

    public GcsStorageService(Storage storage) {
        this.storage = storage;
    }

    @Value("${gcs.bucket-name}")
    private String bucketName;

    /**
     * Upload the files into GCS bucket
     */
    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String uniqueName = UUID.randomUUID() + "_" + originalName;

        BlobId blobId = BlobId.of(bucketName, uniqueName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        String publicUrl = "https://storage.googleapis.com/" + bucketName + "/" + uniqueName;

        Map<String, String> result = new HashMap<>();
        result.put("fileName", uniqueName);
        result.put("originalName", originalName);
        result.put("url", publicUrl);
        result.put("size", String.valueOf(file.getSize()));
        result.put("contentType", file.getContentType());

        return result;
    }

    /**
     * list all files in the bucket
     */
    public List<Map<String, String>> listFiles() {
        List<Map<String, String>> files = new ArrayList<>();

        storage.list(bucketName).iterateAll().forEach(blob -> {
            Map<String, String> fileInfo = new HashMap<>();
            fileInfo.put("name", blob.getName());
            fileInfo.put("size", String.valueOf(blob.getSize()));
            fileInfo.put("contentType", blob.getContentType());
            fileInfo.put("url", "https://storage.googleapis.com/" + bucketName + "/" + blob.getName());
            files.add(fileInfo);
        });

        return files;
    }

    /**
     * delete files
     */
    public boolean deleteFile(String fileName) {
        BlobId blobId = BlobId.of(bucketName, fileName);
        return storage.delete(blobId);
    }

    /**
     * return the bucket name
     */
    public String getBucketName() {
        return bucketName;
    }
}
