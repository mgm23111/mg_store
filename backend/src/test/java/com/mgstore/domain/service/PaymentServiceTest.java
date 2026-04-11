package com.mgstore.domain.service;

import com.mgstore.application.dto.response.CulqiChargeResponse;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.OrderRepository;
import com.mgstore.domain.repository.PaymentRepository;
import com.mgstore.infrastructure.exception.PaymentException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import com.mgstore.util.Constants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderService orderService;

    @Mock
    private CulqiService culqiService;

    @Mock
    private WhatsAppService whatsAppService;

    @InjectMocks
    private PaymentService paymentService;

    private Order order;
    private Payment payment;
    private String culqiToken;

    @BeforeEach
    void setUp() {
        culqiToken = "tkn_test_123456789";

        // Setup Order
        order = Order.builder()
                .id(1L)
                .orderNumber("ORD-20240101-00001")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status(Constants.ORDER_STATUS_PENDING)
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(210))
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        // Setup Payment - CULQI
        payment = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_CULQI)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testProcessCulqiPayment_Success() {
        // Arrange
        CulqiChargeResponse culqiResponse = CulqiChargeResponse.builder()
                .id("chr_test_123456")
                .transactionId("txn_test_789012")
                .amount(21000) // 210.00 PEN in cents
                .currencyCode("PEN")
                .email("john@example.com")
                .outcome(new CulqiChargeResponse.Outcome(
                        "venta_exitosa",
                        "AUT0000",
                        "Pago aprobado",
                        "Tu compra fue aprobada"
                ))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdAndStatus(1L, Constants.PAYMENT_STATUS_PENDING))
                .thenReturn(Optional.of(payment));
        when(culqiService.createCharge(any())).thenReturn(culqiResponse);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        doNothing().when(orderService).approvePayment(1L);
        doNothing().when(whatsAppService).sendOrderConfirmation(any(Order.class));

        // Act
        Payment result = paymentService.processCulqiPayment(1L, culqiToken);

        // Assert
        assertNotNull(result);
        assertEquals(Constants.PAYMENT_STATUS_COMPLETED, payment.getStatus());
        assertEquals("chr_test_123456", payment.getCulqiChargeId());
        assertEquals("txn_test_789012", payment.getCulqiTransactionId());
        assertNotNull(payment.getCompletedAt());
        verify(orderService, times(1)).approvePayment(1L);
        verify(whatsAppService, times(1)).sendOrderConfirmation(order);
    }

    @Test
    void testProcessCulqiPayment_OrderNotFound() {
        // Arrange
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.processCulqiPayment(999L, culqiToken);
        });
        verify(culqiService, never()).createCharge(any());
    }

    @Test
    void testProcessCulqiPayment_OrderNotPending() {
        // Arrange
        order.setStatus(Constants.ORDER_STATUS_PAID);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.processCulqiPayment(1L, culqiToken);
        });
        verify(culqiService, never()).createCharge(any());
    }

    @Test
    void testProcessCulqiPayment_PaymentNotFound() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdAndStatus(1L, Constants.PAYMENT_STATUS_PENDING))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.processCulqiPayment(1L, culqiToken);
        });
        verify(culqiService, never()).createCharge(any());
    }

    @Test
    void testProcessCulqiPayment_WrongPaymentMethod() {
        // Arrange
        payment.setPaymentMethod(Constants.PAYMENT_METHOD_YAPE);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdAndStatus(1L, Constants.PAYMENT_STATUS_PENDING))
                .thenReturn(Optional.of(payment));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.processCulqiPayment(1L, culqiToken);
        });
        verify(culqiService, never()).createCharge(any());
    }

    @Test
    void testProcessCulqiPayment_CulqiFailure() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdAndStatus(1L, Constants.PAYMENT_STATUS_PENDING))
                .thenReturn(Optional.of(payment));
        when(culqiService.createCharge(any()))
                .thenThrow(new PaymentException("Card declined"));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.processCulqiPayment(1L, culqiToken);
        });
        assertEquals(Constants.PAYMENT_STATUS_FAILED, payment.getStatus());
        verify(orderService, never()).approvePayment(anyLong());
    }

    @Test
    void testGetPendingYapePayments() {
        // Arrange
        Payment yapePayment1 = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_PENDING)
                .build();

        Payment yapePayment2 = Payment.builder()
                .id(2L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(150))
                .status(Constants.PAYMENT_STATUS_PENDING)
                .build();

        List<Payment> pendingYapePayments = List.of(yapePayment1, yapePayment2);
        when(paymentRepository.findPendingYapePayments()).thenReturn(pendingYapePayments);

        // Act
        List<Payment> result = paymentService.getPendingYapePayments();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(paymentRepository, times(1)).findPendingYapePayments();
    }

    @Test
    void testApproveYapePayment_Success() {
        // Arrange
        Payment yapePayment = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_PENDING)
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(yapePayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(yapePayment);
        doNothing().when(orderService).approvePayment(1L);
        doNothing().when(whatsAppService).sendOrderConfirmation(any(Order.class));

        // Act
        Payment result = paymentService.approveYapePayment(1L, 1L, "Payment verified");

        // Assert
        assertNotNull(result);
        assertEquals(Constants.PAYMENT_STATUS_COMPLETED, result.getStatus());
        assertEquals("Payment verified", result.getYapeApprovalNotes());
        assertNotNull(result.getCompletedAt());
        verify(orderService, times(1)).approvePayment(1L);
        verify(whatsAppService, times(1)).sendOrderConfirmation(order);
    }

    @Test
    void testApproveYapePayment_PaymentNotFound() {
        // Arrange
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.approveYapePayment(999L, 1L, "Test");
        });
        verify(orderService, never()).approvePayment(anyLong());
    }

    @Test
    void testApproveYapePayment_WrongPaymentMethod() {
        // Arrange
        payment.setPaymentMethod(Constants.PAYMENT_METHOD_CULQI);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.approveYapePayment(1L, 1L, "Test");
        });
        verify(orderService, never()).approvePayment(anyLong());
    }

    @Test
    void testApproveYapePayment_WrongStatus() {
        // Arrange
        Payment yapePayment = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_COMPLETED)
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(yapePayment));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.approveYapePayment(1L, 1L, "Test");
        });
        verify(orderService, never()).approvePayment(anyLong());
    }

    @Test
    void testRejectYapePayment_Success() {
        // Arrange
        Payment yapePayment = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_PENDING)
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(yapePayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(yapePayment);
        doNothing().when(orderService).cancelOrder(1L);

        // Act
        Payment result = paymentService.rejectYapePayment(1L, 1L, "Invalid transfer");

        // Assert
        assertNotNull(result);
        assertEquals(Constants.PAYMENT_STATUS_FAILED, result.getStatus());
        assertEquals("Invalid transfer", result.getYapeApprovalNotes());
        verify(orderService, times(1)).cancelOrder(1L);
        verify(whatsAppService, never()).sendOrderConfirmation(any());
    }

    @Test
    void testRejectYapePayment_PaymentNotFound() {
        // Arrange
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.rejectYapePayment(999L, 1L, "Test");
        });
        verify(orderService, never()).cancelOrder(anyLong());
    }

    @Test
    void testRejectYapePayment_WrongPaymentMethod() {
        // Arrange
        payment.setPaymentMethod(Constants.PAYMENT_METHOD_CULQI);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            paymentService.rejectYapePayment(1L, 1L, "Test");
        });
        verify(orderService, never()).cancelOrder(anyLong());
    }

    @Test
    void testGetPaymentByOrderId_Success() {
        // Arrange
        List<Payment> payments = List.of(payment);
        when(paymentRepository.findByOrderId(1L)).thenReturn(payments);

        // Act
        Payment result = paymentService.getPaymentByOrderId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(payment.getId(), result.getId());
        verify(paymentRepository, times(1)).findByOrderId(1L);
    }

    @Test
    void testGetPaymentByOrderId_NotFound() {
        // Arrange
        when(paymentRepository.findByOrderId(999L)).thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.getPaymentByOrderId(999L);
        });
    }

    @Test
    void testGetPaymentByOrderId_MultiplePayments() {
        // Arrange
        Payment payment1 = Payment.builder()
                .id(1L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_YAPE)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_FAILED)
                .build();

        Payment payment2 = Payment.builder()
                .id(2L)
                .order(order)
                .paymentMethod(Constants.PAYMENT_METHOD_CULQI)
                .amount(BigDecimal.valueOf(210))
                .status(Constants.PAYMENT_STATUS_COMPLETED)
                .build();

        List<Payment> payments = List.of(payment1, payment2);
        when(paymentRepository.findByOrderId(1L)).thenReturn(payments);

        // Act
        Payment result = paymentService.getPaymentByOrderId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(payment2.getId(), result.getId()); // Should return latest payment
    }
}
