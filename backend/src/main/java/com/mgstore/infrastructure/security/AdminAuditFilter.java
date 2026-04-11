package com.mgstore.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminAuditFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AdminAuditFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        if (!isAdminWriteOperation(request)) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return;
        }

        String principal = authentication.getName();
        log.info("ADMIN_AUDIT user={} method={} path={} status={}",
                principal,
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus());
    }

    private boolean isAdminWriteOperation(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        boolean isWrite = "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);

        return isWrite && uri.contains("/admin/");
    }
}
