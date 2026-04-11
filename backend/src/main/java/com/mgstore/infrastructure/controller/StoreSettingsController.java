package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.StoreSettingsRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.StoreSettingsResponse;
import com.mgstore.domain.service.StoreSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class StoreSettingsController {

    @Autowired
    private StoreSettingsService storeSettingsService;

    @GetMapping("/store-settings")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> getStoreSettings() {
        StoreSettingsResponse settings = storeSettingsService.getSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/admin/store-settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> updateStoreSettings(
            @Valid @RequestBody StoreSettingsRequest request) {
        StoreSettingsResponse updated = storeSettingsService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success("Store settings updated successfully", updated));
    }

    @PostMapping(value = "/admin/store-settings/logo/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> uploadStoreLogo(
            @RequestParam("file") MultipartFile file) {
        StoreSettingsResponse updated = storeSettingsService.uploadLogo(file);
        return ResponseEntity.ok(ApiResponse.success("Store logo uploaded successfully", updated));
    }
}
