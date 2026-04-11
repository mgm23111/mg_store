package com.mgstore.domain.service;

import com.mgstore.application.dto.request.GiftCardRequest;
import com.mgstore.application.dto.response.GiftCardResponse;
import com.mgstore.domain.entity.GiftCard;
import com.mgstore.domain.repository.GiftCardRepository;
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
class GiftCardServiceTest {

    @Mock
    private GiftCardRepository giftCardRepository;

    @InjectMocks
    private GiftCardService giftCardService;

    private GiftCard giftCard;
    private GiftCardRequest giftCardRequest;

    @BeforeEach
    void setUp() {
        // Setup Gift Card
        giftCard = GiftCard.builder()
                .id(1L)
                .code("GC-2024-ABCD-1234")
                .initialBalance(BigDecimal.valueOf(100))
                .currentBalance(BigDecimal.valueOf(100))
                .validUntil(LocalDateTime.now().plusDays(365))
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Setup Gift Card Request
        giftCardRequest = GiftCardRequest.builder()
                .code("GC-2024-NEW-5678")
                .initialBalance(BigDecimal.valueOf(50))
                .validUntil(LocalDateTime.now().plusDays(180))
                .isActive(true)
                .build();
    }

    @Test
    void testGetAllGiftCards() {
        // Arrange
        GiftCard giftCard2 = GiftCard.builder()
                .id(2L)
                .code("GC-2024-EFGH-5678")
                .initialBalance(BigDecimal.valueOf(200))
                .currentBalance(BigDecimal.valueOf(150))
                .validUntil(LocalDateTime.now().plusDays(365))
                .isActive(true)
                .build();

        List<GiftCard> giftCards = List.of(giftCard, giftCard2);
        when(giftCardRepository.findAll()).thenReturn(giftCards);

        // Act
        List<GiftCardResponse> result = giftCardService.getAllGiftCards();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(giftCardRepository, times(1)).findAll();
    }

    @Test
    void testGetActiveGiftCards() {
        // Arrange
        List<GiftCard> activeGiftCards = List.of(giftCard);
        when(giftCardRepository.findByIsActiveTrue()).thenReturn(activeGiftCards);

        // Act
        List<GiftCardResponse> result = giftCardService.getActiveGiftCards();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(giftCardRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    void testGetGiftCardById_Success() {
        // Arrange
        when(giftCardRepository.findById(1L)).thenReturn(Optional.of(giftCard));

        // Act
        GiftCardResponse result = giftCardService.getGiftCardById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("GC-2024-ABCD-1234", result.getCode());
        assertEquals(BigDecimal.valueOf(100), result.getCurrentBalance());
        verify(giftCardRepository, times(1)).findById(1L);
    }

    @Test
    void testGetGiftCardById_NotFound() {
        // Arrange
        when(giftCardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.getGiftCardById(999L);
        });
    }

    @Test
    void testGetGiftCardByCode_Success() {
        // Arrange
        when(giftCardRepository.findByCode("GC-2024-ABCD-1234")).thenReturn(Optional.of(giftCard));

        // Act
        GiftCardResponse result = giftCardService.getGiftCardByCode("GC-2024-ABCD-1234");

        // Assert
        assertNotNull(result);
        assertEquals("GC-2024-ABCD-1234", result.getCode());
        verify(giftCardRepository, times(1)).findByCode("GC-2024-ABCD-1234");
    }

    @Test
    void testGetGiftCardByCode_NotFound() {
        // Arrange
        when(giftCardRepository.findByCode("NONEXISTENT")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.getGiftCardByCode("NONEXISTENT");
        });
    }

    @Test
    void testValidateGiftCard_Success() {
        // Arrange
        when(giftCardRepository.findByCode("GC-2024-ABCD-1234")).thenReturn(Optional.of(giftCard));

        // Act
        GiftCardResponse result = giftCardService.validateGiftCard("GC-2024-ABCD-1234");

        // Assert
        assertNotNull(result);
        assertEquals("GC-2024-ABCD-1234", result.getCode());
        assertTrue(result.getIsValid());
        verify(giftCardRepository, times(1)).findByCode("GC-2024-ABCD-1234");
    }

    @Test
    void testValidateGiftCard_InvalidCode() {
        // Arrange
        when(giftCardRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.validateGiftCard("INVALID");
        });
    }

    @Test
    void testValidateGiftCard_NoBalance() {
        // Arrange
        GiftCard emptyGiftCard = GiftCard.builder()
                .id(2L)
                .code("GC-EMPTY")
                .initialBalance(BigDecimal.valueOf(50))
                .currentBalance(BigDecimal.ZERO) // No balance
                .validUntil(LocalDateTime.now().plusDays(365))
                .isActive(true)
                .build();

        when(giftCardRepository.findByCode("GC-EMPTY")).thenReturn(Optional.of(emptyGiftCard));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.validateGiftCard("GC-EMPTY");
        });
    }

    @Test
    void testValidateGiftCard_Expired() {
        // Arrange
        GiftCard expiredGiftCard = GiftCard.builder()
                .id(3L)
                .code("GC-EXPIRED")
                .initialBalance(BigDecimal.valueOf(100))
                .currentBalance(BigDecimal.valueOf(100))
                .validUntil(LocalDateTime.now().minusDays(1)) // Expired
                .isActive(true)
                .build();

        when(giftCardRepository.findByCode("GC-EXPIRED")).thenReturn(Optional.of(expiredGiftCard));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.validateGiftCard("GC-EXPIRED");
        });
    }

    @Test
    void testValidateGiftCard_Inactive() {
        // Arrange
        GiftCard inactiveGiftCard = GiftCard.builder()
                .id(4L)
                .code("GC-INACTIVE")
                .initialBalance(BigDecimal.valueOf(100))
                .currentBalance(BigDecimal.valueOf(100))
                .validUntil(LocalDateTime.now().plusDays(365))
                .isActive(false) // Inactive
                .build();

        when(giftCardRepository.findByCode("GC-INACTIVE")).thenReturn(Optional.of(inactiveGiftCard));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.validateGiftCard("GC-INACTIVE");
        });
    }

    @Test
    void testCheckBalance_Success() {
        // Arrange
        when(giftCardRepository.findByCode("GC-2024-ABCD-1234")).thenReturn(Optional.of(giftCard));

        // Act
        BigDecimal balance = giftCardService.checkBalance("GC-2024-ABCD-1234");

        // Assert
        assertNotNull(balance);
        assertEquals(BigDecimal.valueOf(100), balance);
        verify(giftCardRepository, times(1)).findByCode("GC-2024-ABCD-1234");
    }

    @Test
    void testCheckBalance_NotFound() {
        // Arrange
        when(giftCardRepository.findByCode("NONEXISTENT")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.checkBalance("NONEXISTENT");
        });
    }

    @Test
    void testCreateGiftCard_Success() {
        // Arrange
        when(giftCardRepository.existsByCode("GC-2024-NEW-5678")).thenReturn(false);
        when(giftCardRepository.save(any(GiftCard.class))).thenAnswer(invocation -> {
            GiftCard gc = invocation.getArgument(0);
            gc.setId(1L);
            return gc;
        });

        // Act
        GiftCardResponse result = giftCardService.createGiftCard(giftCardRequest);

        // Assert
        assertNotNull(result);
        assertEquals("GC-2024-NEW-5678", result.getCode());
        assertEquals(BigDecimal.valueOf(50), result.getInitialBalance());
        assertEquals(BigDecimal.valueOf(50), result.getCurrentBalance());
        verify(giftCardRepository, times(1)).save(any(GiftCard.class));
    }

    @Test
    void testCreateGiftCard_AutoGenerateCode() {
        // Arrange
        giftCardRequest.setCode(null); // No code provided
        when(giftCardRepository.existsByCode(anyString())).thenReturn(false);
        when(giftCardRepository.save(any(GiftCard.class))).thenAnswer(invocation -> {
            GiftCard gc = invocation.getArgument(0);
            gc.setId(1L);
            return gc;
        });

        // Act
        GiftCardResponse result = giftCardService.createGiftCard(giftCardRequest);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCode());
        verify(giftCardRepository, times(1)).save(any(GiftCard.class));
    }

    @Test
    void testCreateGiftCard_CodeAlreadyExists() {
        // Arrange
        when(giftCardRepository.existsByCode("GC-2024-NEW-5678")).thenReturn(true);

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.createGiftCard(giftCardRequest);
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testUpdateGiftCard_Success() {
        // Arrange
        when(giftCardRepository.findById(1L)).thenReturn(Optional.of(giftCard));
        when(giftCardRepository.save(any(GiftCard.class))).thenReturn(giftCard);

        giftCardRequest.setValidUntil(LocalDateTime.now().plusDays(500)); // Update expiry

        // Act
        GiftCardResponse result = giftCardService.updateGiftCard(1L, giftCardRequest);

        // Assert
        assertNotNull(result);
        verify(giftCardRepository, times(1)).findById(1L);
        verify(giftCardRepository, times(1)).save(any(GiftCard.class));
    }

    @Test
    void testUpdateGiftCard_NotFound() {
        // Arrange
        when(giftCardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.updateGiftCard(999L, giftCardRequest);
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testAddBalance_Success() {
        // Arrange
        when(giftCardRepository.findById(1L)).thenReturn(Optional.of(giftCard));
        when(giftCardRepository.save(any(GiftCard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal amountToAdd = BigDecimal.valueOf(50);

        // Act
        GiftCardResponse result = giftCardService.addBalance(1L, amountToAdd);

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(150), giftCard.getCurrentBalance());
        verify(giftCardRepository, times(1)).save(giftCard);
    }

    @Test
    void testAddBalance_InvalidAmount() {
        // Arrange
        BigDecimal invalidAmount = BigDecimal.valueOf(-10);

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.addBalance(1L, invalidAmount);
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testAddBalance_ZeroAmount() {
        // Arrange
        BigDecimal zeroAmount = BigDecimal.ZERO;

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.addBalance(1L, zeroAmount);
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testAddBalance_NotFound() {
        // Arrange
        when(giftCardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.addBalance(999L, BigDecimal.valueOf(50));
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testDeactivateGiftCard_Success() {
        // Arrange
        when(giftCardRepository.findById(1L)).thenReturn(Optional.of(giftCard));
        when(giftCardRepository.save(any(GiftCard.class))).thenReturn(giftCard);

        // Act
        giftCardService.deactivateGiftCard(1L);

        // Assert
        assertFalse(giftCard.getIsActive());
        verify(giftCardRepository, times(1)).save(giftCard);
    }

    @Test
    void testDeactivateGiftCard_NotFound() {
        // Arrange
        when(giftCardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.deactivateGiftCard(999L);
        });
        verify(giftCardRepository, never()).save(any());
    }

    @Test
    void testDeleteGiftCard_Success() {
        // Arrange
        GiftCard unusedGiftCard = GiftCard.builder()
                .id(10L)
                .code("GC-UNUSED")
                .initialBalance(BigDecimal.valueOf(100))
                .currentBalance(BigDecimal.valueOf(100)) // Not used
                .build();

        when(giftCardRepository.findById(10L)).thenReturn(Optional.of(unusedGiftCard));
        doNothing().when(giftCardRepository).delete(unusedGiftCard);

        // Act
        giftCardService.deleteGiftCard(10L);

        // Assert
        verify(giftCardRepository, times(1)).delete(unusedGiftCard);
    }

    @Test
    void testDeleteGiftCard_AlreadyUsed() {
        // Arrange
        GiftCard usedGiftCard = GiftCard.builder()
                .id(11L)
                .code("GC-USED")
                .initialBalance(BigDecimal.valueOf(100))
                .currentBalance(BigDecimal.valueOf(50)) // Partially used
                .build();

        when(giftCardRepository.findById(11L)).thenReturn(Optional.of(usedGiftCard));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            giftCardService.deleteGiftCard(11L);
        });
        verify(giftCardRepository, never()).delete(any());
    }

    @Test
    void testDeleteGiftCard_NotFound() {
        // Arrange
        when(giftCardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            giftCardService.deleteGiftCard(999L);
        });
        verify(giftCardRepository, never()).delete(any());
    }
}
