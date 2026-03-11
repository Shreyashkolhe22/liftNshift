package com.shifting.service.impl;

import com.shifting.exception.ApiException;
import com.shifting.model.PredefinedItem;
import com.shifting.repository.PredefinedItemRepository;
import com.shifting.service.PredefinedItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PredefinedItemServiceImpl implements PredefinedItemService {

    private final PredefinedItemRepository predefinedItemRepository;

    @Override
    public List<PredefinedItem> getAllItems() {
        return predefinedItemRepository.findAll();
    }

    @Override
    public PredefinedItem getItemById(Long id) {
        return predefinedItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Predefined item not found with id: " + id
                ));
    }
}