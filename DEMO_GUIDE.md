# 🎮 ELECTRIC GRID PYGAME DEMO - STEP-BY-STEP GUIDE

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Install Dependencies
```bash
pip install pygame
```

### Step 2: Verify Installation
```bash
python3 verify_demo.py
```
**Expected output**: All tests should pass ✅

### Step 3: Run Demo
```bash
python3 demo_launcher.py
```
**Expected result**: Pygame window opens with grid visualization

---

## 🧪 Demo Test Scenarios

### 🟢 Test 1: Stable Grid
**Purpose**: Verify basic functionality
1. Click **"Demo: Stable Grid"** (green button)
2. Click **"Simulate Failures"**
3. **✅ Expected**: All nodes stay green (stable)

### 🟡 Test 2: Overload Detection  
**Purpose**: Test overload visualization
1. Click **"Demo: Overload"** (orange button)
2. Click **"Simulate Failures"**
3. **✅ Expected**: Some nodes/edges turn orange

### 🔴 Test 3: Cascade Failures
**Purpose**: Test cascading failure simulation
1. Click **"Demo: Cascade"** (red button)
2. Click **"Simulate Failures"**
3. **✅ Expected**: Multiple components fail (turn red)

---

## 🎯 What You Should See

### Visual Indicators:
- **Green Nodes**: Normal operation
- **Orange Nodes**: Overloaded (near capacity)
- **Red Nodes**: Failed (exceeded capacity)
- **Blue Edges**: Normal transmission lines
- **Orange Edges**: Overloaded transmission lines  
- **Red Edges**: Failed transmission lines
- **Purple Outline**: Selected node
- **Numbers**: Current load / Maximum capacity

### Control Panel Stats:
- **Nodes**: Total number of substations
- **Edges**: Total number of transmission lines
- **Active Nodes/Edges**: Currently operational
- **Connected**: Whether grid is fully connected
- **Overloaded**: Components at/over capacity

---

## 🕹️ Interactive Controls

### Mouse Controls:
- **Left Click on Node**: Select and view details
- **Drag Node**: Move nodes around the grid
- **Click Empty Space**: Deselect current node

### Button Controls:
- **Reset Grid**: Restore to original state
- **Simulate Failures**: Run cascading failure simulation
- **Increase Load**: Manually increase all loads
- **Toggle Info**: Show/hide load numbers
- **Add Node**: Add new substation randomly

---

## 🔧 Troubleshooting

### Issue: Window doesn't open
**Solution**: Check pygame installation
```bash
pip install pygame
python3 -c "import pygame; print('Pygame OK')"
```

### Issue: Demo buttons don't work
**Solution**: 
1. Click buttons firmly
2. Wait for grid to load
3. Try clicking "Reset Grid" first

### Issue: Simulation doesn't run
**Solution**:
1. Make sure you loaded a demo first
2. Check the load increase percentage (should be a number)
3. Click "Reset Grid" and try again

### Issue: Colors don't change
**Solution**:
1. Make sure to click "Simulate Failures" after loading a demo
2. Try increasing the load percentage
3. Check if grid is actually overloaded in the stats

---

## 📊 Expected Results Summary

| Demo | Load Increase | Expected Outcome |
|------|---------------|------------------|
| Stable Grid | 15% | All green (stable) |
| Overload | 8% | Some orange (overloaded) |
| Cascade | 12% | Multiple red (failed) |

---

## 🏁 Success Checklist

After running all three demos, you should have seen:

- [ ] ✅ Window opens with grid visualization
- [ ] ✅ Three different grid layouts (one per demo)
- [ ] ✅ Nodes and edges change colors during simulation
- [ ] ✅ Control panel shows updated statistics
- [ ] ✅ Can drag nodes to move them around
- [ ] ✅ Selected node shows detailed information
- [ ] ✅ Reset button restores original state
- [ ] ✅ Toggle info shows/hides load numbers

**If all items are checked**: 🎉 **Demo is working perfectly!**

**If some items failed**: ⚠️ **Check troubleshooting section above**

---

## 📚 Understanding the Simulation

### What is Cascading Failure?
When one component fails, its load gets redistributed to other components. If those components become overloaded, they also fail, potentially causing more failures in a domino effect.

### Key Concepts:
- **Load**: Current power demand (MW)
- **Capacity**: Maximum power that can be handled (MW)
- **Overload**: When load ≥ capacity
- **Failure**: When component exceeds capacity and shuts down
- **Connectivity**: Whether all parts of the grid can communicate

### Real-World Relevance:
This simulation models real electrical grid behavior, helping engineers understand:
- Critical infrastructure points
- Failure propagation patterns
- Grid resilience under stress
- Load balancing strategies

---

## 🎓 Next Steps

After completing the demo:
1. Try creating custom scenarios with "Add Node"
2. Experiment with different load increase percentages
3. Analyze which components are most critical
4. Explore the original C++ version for comparison
5. Consider extending the simulation with new features

---

**Happy Testing! 🔌⚡**
