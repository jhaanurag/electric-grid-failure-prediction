#!/usr/bin/env python3
"""
Electric Grid Failure Prediction - Demo Launcher
This script provides a guided demo experience for the pygame version.
"""

import os
import sys

def print_demo_instructions():
    """Print comprehensive demo instructions"""
    print("=" * 60)
    print("🔌 ELECTRIC GRID FAILURE PREDICTION - DEMO LAUNCHER")
    print("=" * 60)
    print()
    print("📋 QUICK DEMO GUIDE:")
    print("-" * 40)
    print("1. 🟢 STABLE GRID TEST")
    print("   • Click 'Demo: Stable Grid' (green button)")
    print("   • Click 'Simulate Failures'")
    print("   • Expected: Grid stays stable (all green)")
    print()
    print("2. 🟡 OVERLOAD TEST")
    print("   • Click 'Demo: Overload' (orange button)")
    print("   • Click 'Simulate Failures'")
    print("   • Expected: Some components turn orange")
    print()
    print("3. 🔴 CASCADE FAILURE TEST")
    print("   • Click 'Demo: Cascade' (red button)")
    print("   • Click 'Simulate Failures'")
    print("   • Expected: Multiple failures (red), grid disconnects")
    print()
    print("🎮 CONTROLS:")
    print("-" * 40)
    print("• Left Click: Select nodes")
    print("• Drag: Move nodes around")
    print("• Reset Grid: Restore original state")
    print("• Toggle Info: Show/hide load numbers")
    print("• Increase Load: Manually increase loads")
    print()
    print("🎯 WHAT TO LOOK FOR:")
    print("-" * 40)
    print("• Node Colors: Green=OK, Orange=Overloaded, Red=Failed")
    print("• Edge Colors: Blue=OK, Orange=Overloaded, Red=Failed")
    print("• Grid Stats: Check connectivity and overload counts")
    print("• Load Numbers: Current/Max capacity ratios")
    print()
    print("⚠️  TROUBLESHOOTING:")
    print("-" * 40)
    print("• If window doesn't open: Check pygame installation")
    print("• If demos don't work: Try clicking buttons multiple times")
    print("• If simulation stuck: Click 'Reset Grid' and try again")
    print()
    print("✅ VERIFICATION CHECKLIST:")
    print("-" * 40)
    print("□ Window opens with grid visualization")
    print("□ Can drag nodes to move them")
    print("□ All three demo buttons load different grids")
    print("□ Simulation changes node/edge colors")
    print("□ Statistics update in control panel")
    print("□ Reset button restores original state")
    print()
    print("🚀 Starting demo in 3 seconds...")
    print("=" * 60)

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import pygame
        print("✅ Pygame found and imported successfully")
        return True
    except ImportError:
        print("❌ Pygame not found!")
        print("Please install pygame using:")
        print("  pip install pygame")
        print("  or")
        print("  pip install -r requirements.txt")
        return False

def main():
    """Main demo launcher function"""
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Print instructions
    print_demo_instructions()
    
    # Wait for user to read
    import time
    time.sleep(3)
    
    # Launch the main program
    try:
        print("🎮 Launching Electric Grid Simulator...")
        print("Close the pygame window to exit.")
        print()
        
        # Import and run the main simulator
        from grid_pygame import ElectricGridSimulator
        simulator = ElectricGridSimulator()
        simulator.run()
        
    except KeyboardInterrupt:
        print("\n👋 Demo interrupted by user")
    except Exception as e:
        print(f"❌ Error running demo: {e}")
        print("Please check the error above and try again.")
    finally:
        print("\n🏁 Demo completed!")

if __name__ == "__main__":
    main()
