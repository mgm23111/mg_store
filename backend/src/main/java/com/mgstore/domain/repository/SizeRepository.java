package com.mgstore.domain.repository;

import com.mgstore.domain.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {

    Optional<Size> findByName(String name);

    List<Size> findAllByOrderBySortOrderAsc();

    boolean existsByName(String name);
}
