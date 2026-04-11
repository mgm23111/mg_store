package com.mgstore.domain.service;

import com.mgstore.application.dto.request.CouponRequest;
import com.mgstore.application.dto.response.CouponResponse;
import com.mgstore.domain.entity.Coupon;
import com.mgstore.domain.repository.CouponRepository;
import com.mgstore.infrastructure.exception.BusinessException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon fixedAmountCoupon;
    private CouponRequest couponRequest;

    @BeforeEach
    void setUp() {
        // Setup Percentage Coupon
        percentageCoupon = Coupon.builder()
                .id(1L)
                .code("SUMMER20")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(20))
                .minPurchaseAmount(BigDecimal.valueOf(50))
                .maxUses(100)
                .currentUses(5)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Setup Fixed Amount Coupon
        fixedAmountCoupon = Coupon.builder()
                .id(2L)
                .code("FIXED50")
                .type("FIXED_AMOUNT")
                .value(BigDecimal.valueOf(50))
                .minPurchaseAmount(BigDecimal.valueOf(200))
                .maxUses(50)
                .currentUses(0)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Setup Coupon Request
        couponRequest = CouponRequest.builder()
                .code("NEWCOUPON")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .minPurchaseAmount(BigDecimal.valueOf(100))
                .maxUses(200)
                .validFrom(LocalDateTime.now())
                .validUntil(LocalDateTime.now().plusDays(60))
                .isActive(true)
                .build();
    }

    @Test
    void testGetAllCoupons() {
        // Arrange
        List<Coupon> coupons = List.of(percentageCoupon, fixedAmountCoupon);
        when(couponRepository.findAll()).thenReturn(coupons);

        // Act
        List<CouponResponse> result = couponService.getAllCoupons();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(couponRepository, times(1)).findAll();
    }

    @Test
    void testGetActiveCoupons() {
        // Arrange
        List<Coupon> activeCoupons = List.of(percentageCoupon, fixedAmountCoupon);
        when(couponRepository.findByIsActiveTrue()).thenReturn(activeCoupons);

        // Act
        List<CouponResponse> result = couponService.getActiveCoupons();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(couponRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    void testGetCouponById_Success() {
        // Arrange
        when(couponRepository.findById(1L)).thenReturn(Optional.of(percentageCoupon));

        // Act
        CouponResponse result = couponService.getCouponById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("SUMMER20", result.getCode());
        assertEquals("PERCENTAGE", result.getType());
        verify(couponRepository, times(1)).findById(1L);
    }

    @Test
    void testGetCouponById_NotFound() {
        // Arrange
        when(couponRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            couponService.getCouponById(999L);
        });
    }

    @Test
    void testGetCouponByCode_Success() {
        // Arrange
        when(couponRepository.findByCode("SUMMER20")).thenReturn(Optional.of(percentageCoupon));

        // Act
        CouponResponse result = couponService.getCouponByCode("SUMMER20");

        // Assert
        assertNotNull(result);
        assertEquals("SUMMER20", result.getCode());
        verify(couponRepository, times(1)).findByCode("SUMMER20");
    }

    @Test
    void testGetCouponByCode_NotFound() {
        // Arrange
        when(couponRepository.findByCode("NONEXISTENT")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            couponService.getCouponByCode("NONEXISTENT");
        });
    }

    @Test
    void testValidateCoupon_Success() {
        // Arrange
        when(couponRepository.findByCode("SUMMER20")).thenReturn(Optional.of(percentageCoupon));

        // Act
        CouponResponse result = couponService.validateCoupon("SUMMER20");

        // Assert
        assertNotNull(result);
        assertEquals("SUMMER20", result.getCode());
        assertTrue(result.getIsValid());
        verify(couponRepository, times(1)).findByCode("SUMMER20");
    }

    @Test
    void testValidateCoupon_InvalidCode() {
        // Arrange
        when(couponRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.validateCoupon("INVALID");
        });
    }

    @Test
    void testValidateCoupon_Expired() {
        // Arrange
        Coupon expiredCoupon = Coupon.builder()
                .id(3L)
                .code("EXPIRED")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .minPurchaseAmount(BigDecimal.ZERO)
                .maxUses(100)
                .currentUses(0)
                .validFrom(LocalDateTime.now().minusDays(30))
                .validUntil(LocalDateTime.now().minusDays(1)) // Expired
                .isActive(true)
                .build();

        when(couponRepository.findByCode("EXPIRED")).thenReturn(Optional.of(expiredCoupon));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.validateCoupon("EXPIRED");
        });
    }

    @Test
    void testValidateCoupon_MaxUsesReached() {
        // Arrange
        Coupon maxUsedCoupon = Coupon.builder()
                .id(4L)
                .code("MAXUSED")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .minPurchaseAmount(BigDecimal.ZERO)
                .maxUses(10)
                .currentUses(10) // Max uses reached
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .build();

        when(couponRepository.findByCode("MAXUSED")).thenReturn(Optional.of(maxUsedCoupon));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.validateCoupon("MAXUSED");
        });
    }

    @Test
    void testValidateCoupon_Inactive() {
        // Arrange
        Coupon inactiveCoupon = Coupon.builder()
                .id(5L)
                .code("INACTIVE")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .minPurchaseAmount(BigDecimal.ZERO)
                .maxUses(100)
                .currentUses(0)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .isActive(false) // Inactive
                .build();

        when(couponRepository.findByCode("INACTIVE")).thenReturn(Optional.of(inactiveCoupon));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.validateCoupon("INACTIVE");
        });
    }

    @Test
    void testCreateCoupon_Success() {
        // Arrange
        when(couponRepository.existsByCode("NEWCOUPON")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon coupon = invocation.getArgument(0);
            coupon.setId(1L);
            return coupon;
        });

        // Act
        CouponResponse result = couponService.createCoupon(couponRequest);

        // Assert
        assertNotNull(result);
        assertEquals("NEWCOUPON", result.getCode());
        verify(couponRepository, times(1)).save(any(Coupon.class));
    }

    @Test
    void testCreateCoupon_InvalidType() {
        // Arrange
        couponRequest.setType("INVALID_TYPE");

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.createCoupon(couponRequest);
        });
        verify(couponRepository, never()).save(any());
    }

    @Test
    void testCreateCoupon_PercentageExceeds100() {
        // Arrange
        couponRequest.setType("PERCENTAGE");
        couponRequest.setValue(BigDecimal.valueOf(150));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.createCoupon(couponRequest);
        });
        verify(couponRepository, never()).save(any());
    }

    @Test
    void testCreateCoupon_CodeAlreadyExists() {
        // Arrange
        when(couponRepository.existsByCode("NEWCOUPON")).thenReturn(true);

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.createCoupon(couponRequest);
        });
        verify(couponRepository, never()).save(any());
    }

    @Test
    void testCreateCoupon_InvalidDates() {
        // Arrange
        couponRequest.setValidFrom(LocalDateTime.now().plusDays(30));
        couponRequest.setValidUntil(LocalDateTime.now().minusDays(1)); // Before validFrom

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.createCoupon(couponRequest);
        });
        verify(couponRepository, never()).save(any());
    }

    @Test
    void testCreateCoupon_AutoGenerateCode() {
        // Arrange
        couponRequest.setCode(null); // No code provided
        when(couponRepository.existsByCode(anyString())).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon coupon = invocation.getArgument(0);
            coupon.setId(1L);
            return coupon;
        });

        // Act
        CouponResponse result = couponService.createCoupon(couponRequest);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCode());
        verify(couponRepository, times(1)).save(any(Coupon.class));
    }

    @Test
    void testUpdateCoupon_Success() {
        // Arrange
        when(couponRepository.findById(1L)).thenReturn(Optional.of(percentageCoupon));
        when(couponRepository.save(any(Coupon.class))).thenReturn(percentageCoupon);

        couponRequest.setValue(BigDecimal.valueOf(25)); // Update value

        // Act
        CouponResponse result = couponService.updateCoupon(1L, couponRequest);

        // Assert
        assertNotNull(result);
        verify(couponRepository, times(1)).findById(1L);
        verify(couponRepository, times(1)).save(any(Coupon.class));
    }

    @Test
    void testUpdateCoupon_NotFound() {
        // Arrange
        when(couponRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            couponService.updateCoupon(999L, couponRequest);
        });
        verify(couponRepository, never()).save(any());
    }

    @Test
    void testDeactivateCoupon_Success() {
        // Arrange
        when(couponRepository.findById(1L)).thenReturn(Optional.of(percentageCoupon));
        when(couponRepository.save(any(Coupon.class))).thenReturn(percentageCoupon);

        // Act
        couponService.deactivateCoupon(1L);

        // Assert
        assertFalse(percentageCoupon.getIsActive());
        verify(couponRepository, times(1)).save(percentageCoupon);
    }

    @Test
    void testDeleteCoupon_Success() {
        // Arrange
        Coupon unusedCoupon = Coupon.builder()
                .id(10L)
                .code("UNUSED")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .currentUses(0) // Not used
                .build();

        when(couponRepository.findById(10L)).thenReturn(Optional.of(unusedCoupon));
        doNothing().when(couponRepository).delete(unusedCoupon);

        // Act
        couponService.deleteCoupon(10L);

        // Assert
        verify(couponRepository, times(1)).delete(unusedCoupon);
    }

    @Test
    void testDeleteCoupon_AlreadyUsed() {
        // Arrange
        percentageCoupon.setCurrentUses(5); // Already used
        when(couponRepository.findById(1L)).thenReturn(Optional.of(percentageCoupon));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            couponService.deleteCoupon(1L);
        });
        verify(couponRepository, never()).delete(any());
    }

    @Test
    void testDeleteCoupon_NotFound() {
        // Arrange
        when(couponRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            couponService.deleteCoupon(999L);
        });
        verify(couponRepository, never()).delete(any());
    }
}
