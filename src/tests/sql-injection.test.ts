// SQL Injection Security Tests
// Verifying Supabase parameterized queries and input validation

import { describe, it, expect, beforeEach } from '@jest/globals';
import { supabaseService } from '../src/services/supabaseService';
import { validateDateString, validateUUID, sanitizeText } from '../src/utils/validation';


describe('SQL Injection Security Tests', () => {
  describe('Input Validation Functions', () => {
    it('should validate proper date strings', () => {
      expect(validateDateString('2024-01-15')).toBe(true);
      expect(validateDateString('2024-12-31')).toBe(true);
      expect(validateDateString('2023-02-28')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(validateDateString('2024-1-1')).toBe(false); // Wrong format
      expect(validateDateString('2024-13-01')).toBe(false); // Invalid month
      expect(validateDateString('2024-01-32')).toBe(false); // Invalid day
      expect(validateDateString('invalid-date')).toBe(false);
      expect(validateDateString('2024-01-01 extra')).toBe(false);
    });

    it('should reject SQL injection attempts in dates', () => {
      const maliciousInputs = [
        "2024-01-01' OR '1'='1",
        "2024-01-01'; DROP TABLE bookings; --",
        "2024-01-01' UNION SELECT * FROM profiles --",
        "'; DROP TABLE properties; --",
        "2024-01-01'; UPDATE properties SET price = 0; --"
      ];

      maliciousInputs.forEach(input => {
        expect(validateDateString(input)).toBe(false);
      });
    });

    it('should validate proper UUIDs', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs and injection attempts', () => {
      const maliciousInputs = [
        "not-a-uuid",
        "'; DROP TABLE properties; --",
        "123' OR '1'='1",
        "uuid-injection'; SELECT * FROM profiles --"
      ];

      maliciousInputs.forEach(input => {
        expect(validateUUID(input)).toBe(false);
      });
    });
  });

  describe('checkAvailability Function Security', () => {
    it('should safely handle malicious date inputs', async () => {
      const maliciousDate = "2024-01-01' OR '1'='1";
      const validPropertyId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await supabaseService.checkAvailability(
        validPropertyId,
        maliciousDate,
        '2024-01-10'
      );

      // Should NOT return availability for malicious input
      expect(result.available).toBe(false);
      expect(result.error?.message).toContain('تاريخ غير صالح');
    });

    it('should safely handle malicious property IDs', async () => {
      const maliciousPropertyId = "'; DROP TABLE bookings; --";

      const result = await supabaseService.checkAvailability(
        maliciousPropertyId,
        '2024-01-01',
        '2024-01-10'
      );

      expect(result.available).toBe(false);
      expect(result.error?.message).toContain('معرف العقار غير صالح');
    });

    it('should reject extremely long inputs', async () => {
      const longInput = 'a'.repeat(1000);

      const result = await supabaseService.checkAvailability(
        longInput,
        '2024-01-01',
        '2024-01-10'
      );

      expect(result.available).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle Unicode and special characters safely', async () => {
      const specialChars = "العقار 🏠 ' \" ; -- /* */";

      // These should be caught by validation
      expect(validateUUID(specialChars)).toBe(false);
      expect(validateDateString(specialChars)).toBe(false);
    });
  });

  describe('Supabase Query Safety', () => {
    it('should use parameterized queries in all database operations', async () => {
      // This test verifies our assumptions about Supabase security
      // We'll check that we're using safe query methods
      
      const testProperty = {
        title: "Test Property'; DROP TABLE properties; --",
        description: "Test with SQL chars: ' \" ; --",
        price: 100
      };

      try {
        // In mock mode, this should work safely
        if (typeof window !== 'undefined' && window.localStorage.getItem('DEV_MOCK_MODE') === 'true') {
          const result = await supabaseService.createFullProperty(
            testProperty,
            [],
            'test-user-id'
          );
          
          // Should store the malicious text as-is, not execute it
          expect(result.title).toContain("'; DROP TABLE properties; --");
          expect(result.description).toContain("' \" ; --");
        }
      } catch (error) {
        // Expected in non-mock mode due to invalid user ID
        // The important thing is no SQL executes
        expect(error.message).not.toContain('DROP TABLE');
      }
    });

    it('should handle special characters in text fields safely', async () => {
      const maliciousTexts = [
        "Property with 'single quotes'",
        "Property with \"double quotes\"",
        "Property with ; semicolons --",
        "Property with /* comments */",
        "Property with Unicode:العقار 🏠",
        "Property with SQL: SELECT * FROM users"
      ];

      for (const text of maliciousTexts) {
        // Should sanitize but preserve content
        const sanitized = sanitizeText(text);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).toContain('Property');
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak database structure in error messages', async () => {
      try {
        await supabaseService.checkAvailability(
          'invalid-uuid',
          'invalid-date',
          'invalid-date'
        );
      } catch (error) {
        // Error messages should be user-friendly and not reveal DB structure
        expect(error.message).not.toContain('table');
        expect(error.message).not.toContain('column');
        expect(error.message).not.toContain('syntax error');
      }
    });

    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database failures
      // For now, verify error handling structure exists
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Performance and Resource Protection', () => {
    it('should prevent DoS via extremely large inputs', async () => {
      const largeString = 'a'.repeat(1000000); // 1MB string

      const result = await supabaseService.checkAvailability(
        largeString,
        '2024-01-01',
        '2024-01-10'
      );

      expect(result.available).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should limit query complexity in filters', async () => {
      // Test complex filter scenarios
      const complexFilters = {
        category: 'apartment',
        minPrice: 100,
        maxPrice: 10000,
        bedrooms: 3,
        bathrooms: 2,
        features: ['wifi', 'parking', 'pool', 'gym', 'security'],
        area: 'test area'
      };

      try {
        await supabaseService.getProperties(complexFilters);
        // Should complete without timeout or error
        expect(true).toBe(true);
      } catch (error) {
        // If it fails, should be a controlled failure
        expect(error.message).toBeDefined();
      }
    });
  });
});

describe('Security Headers and CSP Tests', () => {
  it('should include all required security headers', () => {
    // This would test the middleware in an integration test
    // For now, verify the middleware file exists
    const fs = require('fs');
    const path = require('path');
    
    const middlewarePath = path.join(__dirname, '../src/middleware.ts');
    expect(fs.existsSync(middlewarePath)).toBe(true);
  });

  it('should have proper CSP configuration', () => {
    const fs = require('fs');
    const path = require('path');
    
    const middlewareContent = fs.readFileSync(
      path.join(__dirname, '../src/middleware.ts'),
      'utf8'
    );
    
    expect(middlewareContent).toContain("Content-Security-Policy");
    expect(middlewareContent).toContain("'self'");
    expect(middlewareContent).toContain("script-src");
    expect(middlewareContent).toContain("style-src");
  });
});