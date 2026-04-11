package com.mgstore.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes
 * Run this class to generate password hashes for database seeding
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Generate hash for admin123
        String password = "admin123";
        String hash = encoder.encode(password);

        System.out.println("=========================================");
        System.out.println("BCrypt Password Hash Generator");
        System.out.println("=========================================");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("=========================================");
        System.out.println("\nSQL Update Statement:");
        System.out.println("UPDATE admins SET password_hash = '" + hash + "' WHERE email = 'admin@mgstore.com';");
        System.out.println("=========================================");
    }
}
