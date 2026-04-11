package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.domain.entity.Size;
import com.mgstore.domain.service.SizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class SizeController {

    @Autowired
    private SizeService sizeService;

    @GetMapping("/sizes")
    public ResponseEntity<ApiResponse<List<Size>>> getAllSizes() {
        List<Size> sizes = sizeService.getAllSizes();
        return ResponseEntity.ok(ApiResponse.success(sizes));
    }

    @GetMapping("/sizes/{id}")
    public ResponseEntity<ApiResponse<Size>> getSizeById(@PathVariable Long id) {
        Size size = sizeService.getSizeById(id);
        return ResponseEntity.ok(ApiResponse.success(size));
    }

    @PostMapping("/admin/sizes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Size>> createSize(@RequestBody Size size) {
        Size created = sizeService.createSize(size);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Size created successfully", created));
    }

    @PutMapping("/admin/sizes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Size>> updateSize(
            @PathVariable Long id,
            @RequestBody Size size) {
        Size updated = sizeService.updateSize(id, size);
        return ResponseEntity.ok(ApiResponse.success("Size updated successfully", updated));
    }

    @DeleteMapping("/admin/sizes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSize(@PathVariable Long id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok(ApiResponse.success("Size deleted successfully", null));
    }
}
