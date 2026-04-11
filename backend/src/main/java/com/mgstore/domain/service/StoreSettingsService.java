package com.mgstore.domain.service;

import com.mgstore.application.dto.request.StoreSettingsRequest;
import com.mgstore.application.dto.response.StoreSettingsResponse;
import com.mgstore.domain.entity.StoreSettings;
import com.mgstore.domain.repository.StoreSettingsRepository;
import com.mgstore.infrastructure.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
public class StoreSettingsService {

    @Autowired
    private StoreSettingsRepository storeSettingsRepository;

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.public-api-base-url:http://localhost:8891/api}")
    private String publicApiBaseUrl;

    @Transactional
    public StoreSettingsResponse getSettings() {
        return mapToResponse(getOrCreateSettings());
    }

    @Transactional
    public StoreSettingsResponse updateSettings(StoreSettingsRequest request) {
        StoreSettings settings = getOrCreateSettings();
        settings.setCompanyName(request.getCompanyName().trim());
        settings.setLogoUrl(request.getLogoUrl());
        StoreSettings saved = storeSettingsRepository.save(settings);
        return mapToResponse(saved);
    }

    @Transactional
    public StoreSettingsResponse uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Logo file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidRequestException("Only image files are allowed");
        }

        String logoUrl = storeLogoFile(file);
        StoreSettings settings = getOrCreateSettings();
        settings.setLogoUrl(logoUrl);
        StoreSettings saved = storeSettingsRepository.save(settings);
        return mapToResponse(saved);
    }

    private StoreSettings getOrCreateSettings() {
        Optional<StoreSettings> existing = storeSettingsRepository.findById(1L);
        if (existing.isPresent()) {
            return existing.get();
        }

        StoreSettings settings = StoreSettings.builder()
                .id(1L)
                .companyName("MG Store")
                .logoUrl(null)
                .build();

        return storeSettingsRepository.save(settings);
    }

    private StoreSettingsResponse mapToResponse(StoreSettings settings) {
        return StoreSettingsResponse.builder()
                .id(settings.getId())
                .companyName(settings.getCompanyName())
                .logoUrl(settings.getLogoUrl())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }

    private String storeLogoFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "logo";
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String filename = UUID.randomUUID() + extension;
            Path logoDir = Paths.get(uploadBaseDir, "company");
            Files.createDirectories(logoDir);

            Path destination = logoDir.resolve(filename);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            String baseUrl = publicApiBaseUrl.endsWith("/") ? publicApiBaseUrl.substring(0, publicApiBaseUrl.length() - 1) : publicApiBaseUrl;
            return baseUrl + "/uploads/company/" + filename;
        } catch (IOException e) {
            throw new InvalidRequestException("Failed to store logo file");
        }
    }
}
