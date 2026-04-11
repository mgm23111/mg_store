package com.mgstore.domain.service;

import com.mgstore.domain.entity.Color;
import com.mgstore.domain.repository.ColorRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ColorService {

    @Autowired
    private ColorRepository colorRepository;

    @Transactional(readOnly = true)
    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Color getColorById(Long id) {
        return colorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", id));
    }

    @Transactional
    public Color createColor(Color color) {
        return colorRepository.save(color);
    }

    @Transactional
    public Color updateColor(Long id, Color colorDetails) {
        Color color = getColorById(id);

        color.setName(colorDetails.getName());
        color.setHexCode(colorDetails.getHexCode());

        return colorRepository.save(color);
    }

    @Transactional
    public void deleteColor(Long id) {
        Color color = getColorById(id);
        colorRepository.delete(color);
    }
}
