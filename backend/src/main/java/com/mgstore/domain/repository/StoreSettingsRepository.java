package com.mgstore.domain.repository;

import com.mgstore.domain.entity.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreSettingsRepository extends JpaRepository<StoreSettings, Long> {
}
