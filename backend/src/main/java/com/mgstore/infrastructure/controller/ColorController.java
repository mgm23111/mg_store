package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.domain.entity.Color;
import com.mgstore.domain.service.ColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @GetMapping("/colors")
    public ResponseEntity<ApiResponse<List<Color>>> getAllColors() {
        List<Color> colors = colorService.getAllColors();
        return ResponseEntity.ok(ApiResponse.success(colors));
    }

    @GetMapping("/colors/{id}")
    public ResponseEntity<ApiResponse<Color>> getColorById(@PathVariable Long id) {
        Color color = colorService.getColorById(id);
        return ResponseEntity.ok(ApiResponse.success(color));
    }

    @PostMapping("/admin/colors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Color>> createColor(@RequestBody Color color) {
        Color created = colorService.createColor(color);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Color created successfully", created));
    }

    @PutMapping("/admin/colors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Color>> updateColor(
            @PathVariable Long id,
            @RequestBody Color color) {
        Color updated = colorService.updateColor(id, color);
        return ResponseEntity.ok(ApiResponse.success("Color updated successfully", updated));
    }

    @DeleteMapping("/admin/colors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ResponseEntity.ok(ApiResponse.success("Color deleted successfully", null));
    }
}
