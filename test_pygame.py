#!/usr/bin/env python3
"""
Simple test script to verify pygame installation and basic functionality
"""

try:
    import pygame
    print("✓ Pygame imported successfully")
    
    # Initialize pygame
    pygame.init()
    print("✓ Pygame initialized successfully")
    
    # Test display
    screen = pygame.display.set_mode((400, 300))
    pygame.display.set_caption("Pygame Test")
    print("✓ Display created successfully")
    
    # Test basic drawing
    screen.fill((255, 255, 255))  # White background
    pygame.draw.circle(screen, (0, 255, 0), (200, 150), 50)  # Green circle
    pygame.display.flip()
    print("✓ Basic drawing works")
    
    # Keep window open for 2 seconds
    pygame.time.wait(2000)
    
    pygame.quit()
    print("✓ All tests passed! Pygame is working correctly.")
    
except ImportError as e:
    print(f"✗ Failed to import pygame: {e}")
    print("Please install pygame using: pip install pygame")
except Exception as e:
    print(f"✗ Error testing pygame: {e}")
    pygame.quit()
