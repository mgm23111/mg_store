package com.mgstore.domain.service;

import com.mgstore.domain.entity.Category;
import com.mgstore.domain.repository.CategoryRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);

        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setIsActive(categoryDetails.getIsActive());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        category.setIsActive(false);
        categoryRepository.save(category);
    }
}
