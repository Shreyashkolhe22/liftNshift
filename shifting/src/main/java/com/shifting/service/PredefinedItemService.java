package com.shifting.service;

import com.shifting.model.PredefinedItem;

import java.util.List;

public interface PredefinedItemService {

    List<PredefinedItem> getAllItems();

    PredefinedItem getItemById(Long id);
}