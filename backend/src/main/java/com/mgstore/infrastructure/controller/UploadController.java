package com.mgstore.infrastructure.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class UploadController {

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @GetMapping("/products/{filename:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) throws IOException {
        Path baseDir = Paths.get(uploadBaseDir, "products").toAbsolutePath().normalize();
        Path filePath = baseDir.resolve(filename).normalize();

        if (!filePath.startsWith(baseDir) || !Files.exists(filePath) || !Files.isReadable(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=604800")
                .body(resource);
    }

    @GetMapping("/company/{filename:.+}")
    public ResponseEntity<Resource> getCompanyAsset(@PathVariable String filename) throws IOException {
        Path baseDir = Paths.get(uploadBaseDir, "company").toAbsolutePath().normalize();
        Path filePath = baseDir.resolve(filename).normalize();

        if (!filePath.startsWith(baseDir) || !Files.exists(filePath) || !Files.isReadable(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=604800")
                .body(resource);
    }
}
