package com.mgstore.domain.service;

import com.mgstore.domain.entity.Size;
import com.mgstore.domain.repository.SizeRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SizeService {

    @Autowired
    private SizeRepository sizeRepository;

    @Transactional(readOnly = true)
    public List<Size> getAllSizes() {
        return sizeRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder"));
    }

    @Transactional(readOnly = true)
    public Size getSizeById(Long id) {
        return sizeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", id));
    }

    @Transactional
    public Size createSize(Size size) {
        return sizeRepository.save(size);
    }

    @Transactional
    public Size updateSize(Long id, Size sizeDetails) {
        Size size = getSizeById(id);

        size.setName(sizeDetails.getName());
        size.setSortOrder(sizeDetails.getSortOrder());

        return sizeRepository.save(size);
    }

    @Transactional
    public void deleteSize(Long id) {
        Size size = getSizeById(id);
        sizeRepository.delete(size);
    }
}
