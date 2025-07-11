#!/usr/bin/env python3
"""
Quick verification script for the Electric Grid Pygame Demo
This script tests individual components without GUI
"""

def test_data_structures():
    """Test the basic data structures"""
    print("🧪 Testing Data Structures...")
    
    try:
        from grid_pygame import Node, Edge, NodeState, EdgeState, UnionFind
        
        # Test Node
        node = Node(0, "Test", 100, 150, 80, 100)
        assert node.state == NodeState.ACTIVE
        node.load = 120
        assert node.state == NodeState.OVERLOADED
        node.active = False
        assert node.state == NodeState.FAILED
        print("  ✅ Node class working correctly")
        
        # Test Edge
        edge = Edge(0, 1, 100, 50)
        assert edge.state == EdgeState.NORMAL
        edge.current_load = 120
        assert edge.state == EdgeState.OVERLOADED
        edge.active = False
        assert edge.state == EdgeState.FAILED
        print("  ✅ Edge class working correctly")
        
        # Test UnionFind
        uf = UnionFind(5)
        uf.union(0, 1)
        uf.union(2, 3)
        assert uf.connected(0, 1)
        assert not uf.connected(0, 2)
        print("  ✅ UnionFind class working correctly")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Data structure test failed: {e}")
        return False

def test_demo_scenarios():
    """Test demo scenario loading"""
    print("🎯 Testing Demo Scenarios...")
    
    try:
        from grid_pygame import ElectricGridSimulator
        
        # Create simulator (without GUI)
        simulator = ElectricGridSimulator()
        
        # Test demo scenarios
        demos = simulator.create_demo_scenarios()
        assert len(demos) == 3
        print(f"  ✅ Created {len(demos)} demo scenarios")
        
        # Test loading each demo
        for i, demo in enumerate(demos):
            success = simulator.load_demo_scenario(i)
            assert success
            assert len(simulator.nodes) == len(demo['nodes'])
            assert len(simulator.edges) == len(demo['edges'])
            print(f"  ✅ Demo {i+1} '{demo['name']}' loaded successfully")
            
        return True
        
    except Exception as e:
        print(f"  ❌ Demo scenario test failed: {e}")
        return False

def test_simulation_logic():
    """Test simulation logic without GUI"""
    print("⚡ Testing Simulation Logic...")
    
    try:
        from grid_pygame import ElectricGridSimulator
        
        # Create simulator and load stable demo
        simulator = ElectricGridSimulator()
        simulator.load_demo_scenario(0)  # Stable grid
        
        # Test connectivity
        connected = simulator.is_connected()
        assert connected
        print("  ✅ Connectivity check working")
        
        # Test state save/restore
        simulator.save_state()
        original_load = simulator.nodes[0].load
        simulator.nodes[0].load *= 2
        simulator.restore_state()
        assert abs(simulator.nodes[0].load - original_load) < 0.01
        print("  ✅ State save/restore working")
        
        # Test cascade simulation (without GUI updates)
        initial_active = sum(1 for n in simulator.nodes if n.active)
        simulator.simulate_cascading_failures(50)  # 50% load increase
        final_active = sum(1 for n in simulator.nodes if n.active)
        print(f"  ✅ Cascade simulation: {initial_active} → {final_active} active nodes")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Simulation logic test failed: {e}")
        return False

def print_test_summary(results):
    """Print test summary"""
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    for i, (test_name, result) in enumerate(zip(
        ["Data Structures", "Demo Scenarios", "Simulation Logic"], 
        results
    )):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i+1}. {test_name}: {status}")
    
    print(f"\nResult: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The pygame demo should work correctly.")
        print("\nNext steps:")
        print("1. Run: python3 demo_launcher.py")
        print("2. Or run: python3 grid_pygame.py")
        print("3. Try the three demo scenarios")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("The pygame demo might not work correctly.")

def main():
    """Main verification function"""
    print("🔍 ELECTRIC GRID PYGAME VERIFICATION")
    print("=" * 50)
    print("This script tests core functionality without opening the GUI.")
    print("If all tests pass, the pygame demo should work correctly.")
    print()
    
    # Run tests
    results = []
    results.append(test_data_structures())
    results.append(test_demo_scenarios())
    results.append(test_simulation_logic())
    
    # Print summary
    print_test_summary(results)

if __name__ == "__main__":
    main()
