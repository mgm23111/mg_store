package com.mgstore.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${security.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${security.rate-limit.login.max-requests:5}")
    private int loginMaxRequests;

    @Value("${security.rate-limit.login.window-seconds:300}")
    private int loginWindowSeconds;

    @Value("${security.rate-limit.checkout.max-requests:20}")
    private int checkoutMaxRequests;

    @Value("${security.rate-limit.checkout.window-seconds:60}")
    private int checkoutWindowSeconds;

    @Value("${security.rate-limit.payment.max-requests:10}")
    private int paymentMaxRequests;

    @Value("${security.rate-limit.payment.window-seconds:60}")
    private int paymentWindowSeconds;

    @Autowired
    private InMemoryRateLimiterService rateLimiterService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        if (shouldRateLimit(request)) {
            String key = buildKey(request);
            RateLimitRule rule = getRule(request);

            if (rule != null) {
                boolean allowed = rateLimiterService.isAllowed(
                        key,
                        rule.maxRequests(),
                        Duration.ofSeconds(rule.windowSeconds())
                );

                if (!allowed) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldRateLimit(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        return path.endsWith("/admin/auth/login")
                || path.endsWith("/checkout")
                || path.endsWith("/payments/culqi");
    }

    private String buildKey(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0].trim();
        }

        return request.getRequestURI() + ":" + ip;
    }

    private RateLimitRule getRule(HttpServletRequest request) {
        String path = request.getRequestURI();

        if (path.endsWith("/admin/auth/login")) {
            return new RateLimitRule(loginMaxRequests, loginWindowSeconds);
        }

        if (path.endsWith("/checkout")) {
            return new RateLimitRule(checkoutMaxRequests, checkoutWindowSeconds);
        }

        if (path.endsWith("/payments/culqi")) {
            return new RateLimitRule(paymentMaxRequests, paymentWindowSeconds);
        }

        return null;
    }

    private record RateLimitRule(int maxRequests, int windowSeconds) {
    }
}
