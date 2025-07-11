import pygame
import math
import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 1500
WINDOW_HEIGHT = 1000
GRID_AREA_WIDTH = 900
GRID_AREA_HEIGHT = 700
CONTROL_PANEL_WIDTH = 500
CONTROL_PANEL_HEIGHT = 900
GRID_MARGIN = 50

# Professional Color Scheme
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
LIGHT_GRAY = (240, 240, 240)
DARK_GRAY = (64, 64, 64)
PANEL_BG = (248, 249, 250)
BUTTON_NORMAL = (220, 220, 220)
BUTTON_HOVER = (200, 200, 200)
BUTTON_PRESSED = (180, 180, 180)

# Grid Colors
NODE_NORMAL = (76, 175, 80)      # Material Green
NODE_OVERLOAD = (255, 152, 0)    # Material Orange
NODE_FAILED = (244, 67, 54)      # Material Red
NODE_SELECTED = (156, 39, 176)   # Material Purple

EDGE_NORMAL = (33, 150, 243)     # Material Blue
EDGE_OVERLOAD = (255, 152, 0)    # Material Orange
EDGE_FAILED = (244, 67, 54)      # Material Red

# Demo Button Colors
DEMO_STABLE = (76, 175, 80)      # Green
DEMO_OVERLOAD = (255, 152, 0)    # Orange
DEMO_CASCADE = (244, 67, 54)     # Red

# Text Colors
TEXT_PRIMARY = (33, 33, 33)
TEXT_SECONDARY = (117, 117, 117)
TEXT_ON_DARK = (255, 255, 255)

# Node states
class NodeState(Enum):
    ACTIVE = "active"
    OVERLOADED = "overloaded"
    FAILED = "failed"

# Edge states
class EdgeState(Enum):
    NORMAL = "normal"
    OVERLOADED = "overloaded"
    FAILED = "failed"

@dataclass
class Node:
    id: int
    name: str
    x: float
    y: float
    load: float
    max_capacity: float
    active: bool = True
    
    @property
    def state(self) -> NodeState:
        if not self.active:
            return NodeState.FAILED
        elif self.load >= self.max_capacity:
            return NodeState.OVERLOADED
        else:
            return NodeState.ACTIVE

@dataclass
class Edge:
    from_node: int
    to_node: int
    capacity: float
    current_load: float
    active: bool = True
    
    @property
    def state(self) -> EdgeState:
        if not self.active:
            return EdgeState.FAILED
        elif self.current_load >= self.capacity:
            return EdgeState.OVERLOADED
        else:
            return EdgeState.NORMAL

class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x: int, y: int):
        px, py = self.find(x), self.find(y)
        if px == py:
            return
        if self.rank[px] < self.rank[py]:
            self.parent[px] = py
        elif self.rank[px] > self.rank[py]:
            self.parent[py] = px
        else:
            self.parent[py] = px
            self.rank[px] += 1
    
    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)

class Button:
    def __init__(self, x: int, y: int, width: int, height: int, text: str, 
                 color: Tuple[int, int, int] = BUTTON_NORMAL, text_color: Tuple[int, int, int] = TEXT_PRIMARY):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.font = pygame.font.Font(None, 24)
        self.hovered = False
        self.clicked = False
        self.enabled = True
    
    def draw(self, screen: pygame.Surface):
        # Determine button state color
        if not self.enabled:
            color = GRAY
            text_color = TEXT_SECONDARY
        elif self.clicked:
            color = BUTTON_PRESSED
            text_color = self.text_color
        elif self.hovered:
            color = BUTTON_HOVER
            text_color = self.text_color
        else:
            color = self.color
            text_color = self.text_color
        
        # Draw button with rounded corners effect
        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, DARK_GRAY, self.rect, 2)
        
        # Add subtle shadow effect
        shadow_rect = pygame.Rect(self.rect.x + 2, self.rect.y + 2, self.rect.width, self.rect.height)
        pygame.draw.rect(screen, LIGHT_GRAY, shadow_rect)
        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, DARK_GRAY, self.rect, 2)
        
        # Draw text
        text_surface = self.font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        if not self.enabled:
            return False
            
        mouse_pos = pygame.mouse.get_pos()
        self.hovered = self.rect.collidepoint(mouse_pos)
        
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.rect.collidepoint(event.pos):
                self.clicked = True
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1:
                was_clicked = self.clicked and self.rect.collidepoint(event.pos)
                self.clicked = False
                return was_clicked
        return False

class InputBox:
    def __init__(self, x: int, y: int, width: int, height: int, text: str = "", placeholder: str = ""):
        self.rect = pygame.Rect(x, y, width, height)
        self.color = WHITE
        self.text = text
        self.placeholder = placeholder
        self.font = pygame.font.Font(None, 24)
        self.active = False
        self.cursor_pos = len(text)
        self.cursor_visible = True
        self.cursor_timer = 0
    
    def handle_event(self, event: pygame.event.Event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.active = self.rect.collidepoint(event.pos)
        elif event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_RETURN or event.key == pygame.K_TAB:
                self.active = False
            elif event.key == pygame.K_BACKSPACE:
                if self.cursor_pos > 0:
                    self.text = self.text[:self.cursor_pos-1] + self.text[self.cursor_pos:]
                    self.cursor_pos -= 1
            elif event.key == pygame.K_DELETE:
                if self.cursor_pos < len(self.text):
                    self.text = self.text[:self.cursor_pos] + self.text[self.cursor_pos+1:]
            elif event.key == pygame.K_LEFT:
                self.cursor_pos = max(0, self.cursor_pos - 1)
            elif event.key == pygame.K_RIGHT:
                self.cursor_pos = min(len(self.text), self.cursor_pos + 1)
            elif event.key == pygame.K_HOME:
                self.cursor_pos = 0
            elif event.key == pygame.K_END:
                self.cursor_pos = len(self.text)
            elif event.unicode.isprintable():
                self.text = self.text[:self.cursor_pos] + event.unicode + self.text[self.cursor_pos:]
                self.cursor_pos += 1
    
    def update(self, dt: float):
        # Update cursor blink
        self.cursor_timer += dt
        if self.cursor_timer >= 500:  # Blink every 500ms
            self.cursor_visible = not self.cursor_visible
            self.cursor_timer = 0
    
    def draw(self, screen: pygame.Surface):
        # Draw input box
        color = NODE_SELECTED if self.active else WHITE
        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, DARK_GRAY, self.rect, 2)
        
        # Determine display text
        display_text = self.text if self.text else self.placeholder
        text_color = TEXT_PRIMARY if self.text else TEXT_SECONDARY
        
        # Draw text
        text_surface = self.font.render(display_text, True, text_color)
        text_x = self.rect.x + 8
        text_y = self.rect.y + (self.rect.height - text_surface.get_height()) // 2
        screen.blit(text_surface, (text_x, text_y))
        
        # Draw cursor
        if self.active and self.cursor_visible and self.text:
            cursor_text = self.text[:self.cursor_pos]
            cursor_width = self.font.size(cursor_text)[0]
            cursor_x = text_x + cursor_width
            cursor_y = text_y
            pygame.draw.line(screen, TEXT_PRIMARY, 
                           (cursor_x, cursor_y), 
                           (cursor_x, cursor_y + text_surface.get_height()), 2)

class ElectricGridSimulator:
    def __init__(self):
        # Initialize pygame safely
        try:
            pygame.init()
            pygame.font.init()
        except pygame.error as e:
            print(f"Failed to initialize pygame: {e}")
            raise
        
        # Set up display
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Electric Grid Failure Prediction - Professional Edition")
        
        # Set up clock for consistent frame rate
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Initialize fonts
        try:
            self.font = pygame.font.Font(None, 24)
            self.small_font = pygame.font.Font(None, 18)
            self.large_font = pygame.font.Font(None, 32)
        except pygame.error:
            # Fallback to system font
            self.font = pygame.font.SysFont("Arial", 24)
            self.small_font = pygame.font.SysFont("Arial", 18) 
            self.large_font = pygame.font.SysFont("Arial", 32)
        
        # Grid data
        self.nodes: List[Node] = []
        self.edges: List[Edge] = []
        self.node_positions: Dict[int, Tuple[float, float]] = {}
        
        # UI state
        self.selected_node: Optional[int] = None
        self.dragging_node: Optional[int] = None
        self.simulation_running = False
        self.show_node_info = True
        self.show_edge_info = True
        self.last_update_time = pygame.time.get_ticks()
        
        # Simulation state (initialize before creating grid)
        self.original_state = None
        self.failure_history = []
        
        # Demo scenarios
        self.demo_scenarios = self.create_demo_scenarios()
        self.current_demo = 0
        
        # Error handling
        self.error_message = ""
        self.error_timer = 0
        
        # Initialize with sample grid (after simulation state is ready)
        self.create_sample_grid()
        
        # UI elements
        self.create_ui_elements()
    
    def create_ui_elements(self):
        # Control panel buttons
        button_width = 180
        button_height = 30
        button_spacing = 40
        start_x = GRID_AREA_WIDTH + 20
        start_y = 50
        
        self.buttons = {
            'reset': Button(start_x, start_y, button_width, button_height, 'Reset Grid'),
            'simulate': Button(start_x, start_y + button_spacing, button_width, button_height, 'Simulate Failures'),
            'increase_load': Button(start_x, start_y + 2*button_spacing, button_width, button_height, 'Increase Load'),
            'demo_stable': Button(start_x, start_y + 3*button_spacing, button_width, button_height, 'Demo: Stable Grid', DEMO_STABLE, TEXT_ON_DARK),
            'demo_overload': Button(start_x, start_y + 4*button_spacing, button_width, button_height, 'Demo: Overload', DEMO_OVERLOAD, TEXT_ON_DARK),
            'demo_cascade': Button(start_x, start_y + 5*button_spacing, button_width, button_height, 'Demo: Cascade', DEMO_CASCADE, TEXT_ON_DARK),
            'critical_analysis': Button(start_x, start_y + 6*button_spacing, button_width, button_height, 'Critical Analysis'),
            'add_node': Button(start_x, start_y + 7*button_spacing, button_width, button_height, 'Add Node'),
            'toggle_info': Button(start_x, start_y + 8*button_spacing, button_width, button_height, 'Toggle Info'),
        }
        
        # Input boxes
        self.input_boxes = {
            'load_increase': InputBox(start_x, start_y + 9*button_spacing, button_width, 30, '10', 'Load increase %'),
        }
    
    def create_sample_grid(self):
        """Create a sample grid for demonstration"""
        # Clear existing data
        self.nodes.clear()
        self.edges.clear()
        
        # Create nodes in a more organized layout
        num_nodes = 6
        center_x, center_y = (GRID_AREA_WIDTH - 2*GRID_MARGIN) // 2 + GRID_MARGIN, (GRID_AREA_HEIGHT - 2*GRID_MARGIN) // 2 + GRID_MARGIN
        radius = min((GRID_AREA_WIDTH - 4*GRID_MARGIN) // 3, (GRID_AREA_HEIGHT - 4*GRID_MARGIN) // 3)
        
        # Ensure nodes stay within bounds
        for i in range(num_nodes):
            angle = 2 * math.pi * i / num_nodes
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            
            # Clamp to valid area
            x = max(GRID_MARGIN + 50, min(GRID_AREA_WIDTH - GRID_MARGIN - 50, x))
            y = max(GRID_MARGIN + 50, min(GRID_AREA_HEIGHT - GRID_MARGIN - 50, y))
            
            # Create balanced load and capacity
            base_load = 80 + i * 10  # Progressive loading
            load_variation = random.uniform(0.8, 1.2)
            load = base_load * load_variation
            capacity = load * random.uniform(1.3, 1.8)  # Safe margin
            
            node = Node(i, f"Station-{i+1}", x, y, load, capacity)
            self.nodes.append(node)
            self.node_positions[i] = (x, y)
        
        # Create a robust grid topology
        connections = [
            (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0),  # Ring topology
            (0, 3), (1, 4), (2, 5)  # Cross connections for redundancy
        ]
        
        for from_id, to_id in connections:
            # Calculate distance-based capacity
            node1, node2 = self.nodes[from_id], self.nodes[to_id]
            distance = math.sqrt((node1.x - node2.x)**2 + (node1.y - node2.y)**2)
            
            # Base load proportional to connected nodes
            base_edge_load = (node1.load + node2.load) * 0.15
            load_variation = random.uniform(0.7, 1.1)
            load = base_edge_load * load_variation
            
            # Capacity with safety margin
            capacity = load * random.uniform(1.5, 2.2)
            
            edge = Edge(from_id, to_id, capacity, load)
            self.edges.append(edge)
        
        # Save initial state
        self.save_state()
    
    def create_demo_scenarios(self) -> List[Dict]:
        """Create predefined demo scenarios for testing"""
        return [
            {
                'name': 'Stable Grid Demo',
                'description': 'A well-balanced grid with safe margins',
                'nodes': [
                    {'name': 'Main', 'x': 400, 'y': 200, 'load': 80, 'capacity': 150},
                    {'name': 'North', 'x': 300, 'y': 100, 'load': 60, 'capacity': 120},
                    {'name': 'South', 'x': 300, 'y': 300, 'load': 70, 'capacity': 130},
                    {'name': 'East', 'x': 500, 'y': 200, 'load': 50, 'capacity': 100},
                    {'name': 'West', 'x': 200, 'y': 200, 'load': 65, 'capacity': 110},
                ],
                'edges': [
                    {'from': 0, 'to': 1, 'load': 30, 'capacity': 80},
                    {'from': 0, 'to': 2, 'load': 35, 'capacity': 90},
                    {'from': 0, 'to': 3, 'load': 25, 'capacity': 75},
                    {'from': 0, 'to': 4, 'load': 40, 'capacity': 85},
                    {'from': 1, 'to': 4, 'load': 20, 'capacity': 60},
                    {'from': 2, 'to': 3, 'load': 15, 'capacity': 50},
                ],
                'test_load_increase': 15,
                'expected_result': 'Should remain stable with 15% load increase'
            },
            {
                'name': 'Overload Demo',
                'description': 'A grid on the edge of overload',
                'nodes': [
                    {'name': 'A', 'x': 250, 'y': 150, 'load': 95, 'capacity': 100},
                    {'name': 'B', 'x': 450, 'y': 150, 'load': 90, 'capacity': 100},
                    {'name': 'C', 'x': 350, 'y': 300, 'load': 85, 'capacity': 100},
                    {'name': 'D', 'x': 350, 'y': 450, 'load': 80, 'capacity': 100},
                ],
                'edges': [
                    {'from': 0, 'to': 1, 'load': 45, 'capacity': 50},
                    {'from': 1, 'to': 2, 'load': 42, 'capacity': 50},
                    {'from': 2, 'to': 3, 'load': 38, 'capacity': 50},
                    {'from': 3, 'to': 0, 'load': 35, 'capacity': 50},
                    {'from': 0, 'to': 2, 'load': 40, 'capacity': 50},
                ],
                'test_load_increase': 8,
                'expected_result': 'Should show overloads with 8% load increase'
            },
            {
                'name': 'Cascade Failure Demo',
                'description': 'A grid that will experience cascading failures',
                'nodes': [
                    {'name': 'Hub', 'x': 400, 'y': 300, 'load': 180, 'capacity': 200},
                    {'name': 'N1', 'x': 300, 'y': 200, 'load': 85, 'capacity': 100},
                    {'name': 'N2', 'x': 500, 'y': 200, 'load': 90, 'capacity': 100},
                    {'name': 'N3', 'x': 300, 'y': 400, 'load': 88, 'capacity': 100},
                    {'name': 'N4', 'x': 500, 'y': 400, 'load': 92, 'capacity': 100},
                    {'name': 'Remote', 'x': 600, 'y': 300, 'load': 70, 'capacity': 100},
                ],
                'edges': [
                    {'from': 0, 'to': 1, 'load': 65, 'capacity': 70},
                    {'from': 0, 'to': 2, 'load': 68, 'capacity': 70},
                    {'from': 0, 'to': 3, 'load': 60, 'capacity': 70},
                    {'from': 0, 'to': 4, 'load': 72, 'capacity': 75},
                    {'from': 2, 'to': 5, 'load': 45, 'capacity': 50},
                    {'from': 4, 'to': 5, 'load': 40, 'capacity': 50},
                    {'from': 1, 'to': 3, 'load': 30, 'capacity': 40},
                ],
                'test_load_increase': 12,
                'expected_result': 'Should trigger cascading failures with 12% load increase'
            }
        ]
    
    def load_demo_scenario(self, demo_index: int):
        """Load a specific demo scenario"""
        try:
            if demo_index < 0 or demo_index >= len(self.demo_scenarios):
                self.error_message = f"Invalid demo index: {demo_index}"
                return False
                
            demo = self.demo_scenarios[demo_index]
            
            # Clear existing grid
            self.nodes.clear()
            self.edges.clear()
            
            # Create nodes with bounds checking
            for i, node_data in enumerate(demo['nodes']):
                # Ensure node positions are within bounds
                x = max(GRID_MARGIN + 50, min(GRID_AREA_WIDTH - GRID_MARGIN - 50, node_data['x']))
                y = max(GRID_MARGIN + 50, min(GRID_AREA_HEIGHT - GRID_MARGIN - 50, node_data['y']))
                
                node = Node(
                    i, 
                    node_data['name'], 
                    x, 
                    y, 
                    node_data['load'], 
                    node_data['capacity']
                )
                self.nodes.append(node)
            
            # Create edges with validation
            for edge_data in demo['edges']:
                from_idx = edge_data['from']
                to_idx = edge_data['to']
                
                # Validate edge indices
                if 0 <= from_idx < len(self.nodes) and 0 <= to_idx < len(self.nodes):
                    edge = Edge(
                        from_idx,
                        to_idx,
                        edge_data['capacity'],
                        edge_data['load']
                    )
                    self.edges.append(edge)
            
            # Save the initial state
            self.save_state()
            
            return True
            
        except Exception as e:
            self.error_message = f"Error loading demo: {str(e)}"
            return False
    
    def get_node_color(self, node: Node) -> Tuple[int, int, int]:
        if node.state == NodeState.FAILED:
            return NODE_FAILED
        elif node.state == NodeState.OVERLOADED:
            return NODE_OVERLOAD
        else:
            return NODE_NORMAL
    
    def get_edge_color(self, edge: Edge) -> Tuple[int, int, int]:
        if edge.state == EdgeState.FAILED:
            return EDGE_FAILED
        elif edge.state == EdgeState.OVERLOADED:
            return EDGE_OVERLOAD
        else:
            return EDGE_NORMAL
    
    def get_edge_width(self, edge: Edge) -> int:
        if edge.state == EdgeState.FAILED:
            return 1
        else:
            # Width based on load ratio
            load_ratio = edge.current_load / edge.capacity
            return max(2, int(6 * load_ratio))
    
    def draw_grid(self):
        # Draw grid background with gradient effect
        grid_rect = pygame.Rect(GRID_MARGIN, GRID_MARGIN, GRID_AREA_WIDTH - 2*GRID_MARGIN, GRID_AREA_HEIGHT - 2*GRID_MARGIN)
        pygame.draw.rect(self.screen, WHITE, grid_rect)
        pygame.draw.rect(self.screen, DARK_GRAY, grid_rect, 3)
        
        # Draw grid lines for better organization
        for i in range(1, 10):
            x = GRID_MARGIN + i * (GRID_AREA_WIDTH - 2*GRID_MARGIN) // 10
            y = GRID_MARGIN + i * (GRID_AREA_HEIGHT - 2*GRID_MARGIN) // 10
            pygame.draw.line(self.screen, LIGHT_GRAY, (x, GRID_MARGIN), (x, GRID_AREA_HEIGHT - GRID_MARGIN), 1)
            pygame.draw.line(self.screen, LIGHT_GRAY, (GRID_MARGIN, y), (GRID_AREA_WIDTH - GRID_MARGIN, y), 1)
        
        # Draw edges with improved styling
        for edge in self.edges:
            if edge.from_node < len(self.nodes) and edge.to_node < len(self.nodes):
                start_pos = (self.nodes[edge.from_node].x, self.nodes[edge.from_node].y)
                end_pos = (self.nodes[edge.to_node].x, self.nodes[edge.to_node].y)
                
                color = self.get_edge_color(edge)
                width = self.get_edge_width(edge)
                
                # Draw edge with rounded ends
                pygame.draw.line(self.screen, color, start_pos, end_pos, width)
                
                # Draw edge info with better formatting
                if self.show_edge_info:
                    mid_x = (start_pos[0] + end_pos[0]) / 2
                    mid_y = (start_pos[1] + end_pos[1]) / 2
                    load_ratio = edge.current_load / edge.capacity
                    load_text = f"{edge.current_load:.1f}/{edge.capacity:.1f} ({load_ratio:.1%})"
                    
                    text_surface = self.small_font.render(load_text, True, TEXT_PRIMARY)
                    text_rect = text_surface.get_rect(center=(mid_x, mid_y))
                    
                    # Draw background for text
                    bg_rect = text_rect.inflate(6, 4)
                    pygame.draw.rect(self.screen, WHITE, bg_rect)
                    pygame.draw.rect(self.screen, DARK_GRAY, bg_rect, 1)
                    self.screen.blit(text_surface, text_rect)
        
        # Draw nodes with improved styling
        for node in self.nodes:
            color = self.get_node_color(node)
            radius = 25
            
            # Draw node shadow
            shadow_pos = (int(node.x + 3), int(node.y + 3))
            pygame.draw.circle(self.screen, LIGHT_GRAY, shadow_pos, radius)
            
            # Draw node circle with gradient effect
            pygame.draw.circle(self.screen, color, (int(node.x), int(node.y)), radius)
            pygame.draw.circle(self.screen, DARK_GRAY, (int(node.x), int(node.y)), radius, 3)
            
            # Draw inner circle for depth
            inner_radius = radius - 8
            inner_color = tuple(min(255, c + 30) for c in color)
            pygame.draw.circle(self.screen, inner_color, (int(node.x), int(node.y)), inner_radius)
            
            # Highlight selected node
            if self.selected_node == node.id:
                pygame.draw.circle(self.screen, NODE_SELECTED, (int(node.x), int(node.y)), radius + 8, 4)
            
            # Draw node name with better typography
            name_surface = self.font.render(node.name, True, TEXT_PRIMARY)
            name_rect = name_surface.get_rect(center=(node.x, node.y - radius - 25))
            
            # Background for name
            name_bg = name_rect.inflate(8, 4)
            pygame.draw.rect(self.screen, WHITE, name_bg)
            pygame.draw.rect(self.screen, DARK_GRAY, name_bg, 1)
            self.screen.blit(name_surface, name_rect)
            
            # Draw node info with better formatting
            if self.show_node_info:
                load_ratio = node.load / node.max_capacity
                info_text = f"{node.load:.1f}/{node.max_capacity:.1f} ({load_ratio:.1%})"
                info_surface = self.small_font.render(info_text, True, TEXT_PRIMARY)
                info_rect = info_surface.get_rect(center=(node.x, node.y + radius + 25))
                
                # Background for info
                info_bg = info_rect.inflate(8, 4)
                pygame.draw.rect(self.screen, WHITE, info_bg)
                pygame.draw.rect(self.screen, DARK_GRAY, info_bg, 1)
                self.screen.blit(info_surface, info_rect)
    
    def draw_control_panel(self):
        # Draw control panel background with gradient
        panel_rect = pygame.Rect(GRID_AREA_WIDTH, 0, CONTROL_PANEL_WIDTH, CONTROL_PANEL_HEIGHT)
        pygame.draw.rect(self.screen, PANEL_BG, panel_rect)
        pygame.draw.rect(self.screen, DARK_GRAY, panel_rect, 3)
        
        # Draw title with better styling
        title_font = pygame.font.Font(None, 36)
        title = title_font.render("Grid Control Panel", True, TEXT_PRIMARY)
        title_rect = pygame.Rect(GRID_AREA_WIDTH + 20, 10, CONTROL_PANEL_WIDTH - 40, 50)
        pygame.draw.rect(self.screen, WHITE, title_rect)
        pygame.draw.rect(self.screen, DARK_GRAY, title_rect, 2)
        
        title_pos = title_rect.center
        title_text_rect = title.get_rect(center=title_pos)
        self.screen.blit(title, title_text_rect)
        
        # Draw section dividers
        section_y = 70
        sections = [
            ("Simulation Controls", 4),
            ("Demo Scenarios", 3), 
            ("Grid Tools", 2)
        ]
        
        current_y = section_y
        for section_name, button_count in sections:
            # Section header
            section_header = self.font.render(section_name, True, TEXT_SECONDARY)
            self.screen.blit(section_header, (GRID_AREA_WIDTH + 20, current_y))
            current_y += 30
            
            # Skip buttons for this section
            current_y += button_count * 40
            current_y += 20  # Extra spacing between sections
        
        # Draw buttons
        for button in self.buttons.values():
            button.draw(self.screen)
        
        # Draw input boxes with labels
        for name, input_box in self.input_boxes.items():
            # Draw label with better styling
            label_text = name.replace('_', ' ').title() + ":"
            label = self.small_font.render(label_text, True, TEXT_PRIMARY)
            label_y = input_box.rect.y - 25
            self.screen.blit(label, (input_box.rect.x, label_y))
            
            input_box.draw(self.screen)
        
        # Draw grid statistics with improved layout
        stats_y = 620
        stats_header = self.font.render("Grid Statistics", True, TEXT_PRIMARY)
        self.screen.blit(stats_header, (GRID_AREA_WIDTH + 20, stats_y))
        
        stats_y += 35
        stats_rect = pygame.Rect(GRID_AREA_WIDTH + 20, stats_y, CONTROL_PANEL_WIDTH - 60, 140)
        pygame.draw.rect(self.screen, WHITE, stats_rect)
        pygame.draw.rect(self.screen, DARK_GRAY, stats_rect, 2)
        
        stats = [
            f"Total Nodes: {len(self.nodes)}",
            f"Total Edges: {len(self.edges)}",
            f"Active Nodes: {sum(1 for n in self.nodes if n.active)} / {len(self.nodes)}",
            f"Active Edges: {sum(1 for e in self.edges if e.active)} / {len(self.edges)}",
            f"Grid Connected: {'Yes' if self.is_connected() else 'No'}",
            f"Overloaded Nodes: {sum(1 for n in self.nodes if n.state == NodeState.OVERLOADED)}",
            f"Overloaded Edges: {sum(1 for e in self.edges if e.state == EdgeState.OVERLOADED)}",
        ]
        
        for i, stat in enumerate(stats):
            color = TEXT_PRIMARY
            # Highlight important stats
            if "No" in stat or "Overloaded" in stat and ": 0" not in stat:
                color = NODE_FAILED
            elif "Connected: Yes" in stat:
                color = NODE_NORMAL
                
            stat_surface = self.small_font.render(stat, True, color)
            self.screen.blit(stat_surface, (GRID_AREA_WIDTH + 30, stats_y + 10 + i * 18))
        
        # Draw demo instructions with better formatting
        demo_y = 440
        demo_header = self.font.render("Demo Instructions", True, TEXT_PRIMARY)
        self.screen.blit(demo_header, (GRID_AREA_WIDTH + 20, demo_y))
        
        demo_y += 35
        demo_rect = pygame.Rect(GRID_AREA_WIDTH + 20, demo_y, CONTROL_PANEL_WIDTH - 60, 120)
        pygame.draw.rect(self.screen, WHITE, demo_rect)
        pygame.draw.rect(self.screen, DARK_GRAY, demo_rect, 2)
        
        demo_instructions = [
            "1. Click a colored demo button",
            "2. Click 'Simulate Failures'",
            "3. Watch color changes",
            "4. Use 'Reset Grid' to restore",
            "",
            "🟢 Stable  🟡 Overload  🔴 Cascade"
        ]
        
        for i, instruction in enumerate(demo_instructions):
            instruction_surface = self.small_font.render(instruction, True, TEXT_PRIMARY)
            self.screen.blit(instruction_surface, (GRID_AREA_WIDTH + 30, demo_y + 10 + i * 16))
        
        # Draw selected node info with better styling
        if self.selected_node is not None and self.selected_node < len(self.nodes):
            node = self.nodes[self.selected_node]
            info_y = 780
            
            info_header = self.font.render("Selected Node Details", True, TEXT_PRIMARY)
            self.screen.blit(info_header, (GRID_AREA_WIDTH + 20, info_y))
            
            info_y += 35
            info_rect = pygame.Rect(GRID_AREA_WIDTH + 20, info_y, CONTROL_PANEL_WIDTH - 60, 100)
            pygame.draw.rect(self.screen, WHITE, info_rect)
            pygame.draw.rect(self.screen, DARK_GRAY, info_rect, 2)
            
            load_ratio = node.load / node.max_capacity
            info_lines = [
                f"Name: {node.name}",
                f"Load: {node.load:.1f} MW",
                f"Capacity: {node.max_capacity:.1f} MW", 
                f"Load Ratio: {load_ratio:.1%}",
                f"Status: {node.state.value.title()}",
            ]
            
            for i, line in enumerate(info_lines):
                color = TEXT_PRIMARY
                if "Status:" in line:
                    if node.state == NodeState.FAILED:
                        color = NODE_FAILED
                    elif node.state == NodeState.OVERLOADED:
                        color = NODE_OVERLOAD
                    else:
                        color = NODE_NORMAL
                        
                info_surface = self.small_font.render(line, True, color)
                self.screen.blit(info_surface, (GRID_AREA_WIDTH + 30, info_y + 10 + i * 16))
        
        # Draw error messages
        if self.error_message:
            error_y = CONTROL_PANEL_HEIGHT - 50
            error_rect = pygame.Rect(GRID_AREA_WIDTH + 20, error_y, CONTROL_PANEL_WIDTH - 40, 30)
            pygame.draw.rect(self.screen, NODE_FAILED, error_rect)
            pygame.draw.rect(self.screen, DARK_GRAY, error_rect, 2)
            
            error_surface = self.small_font.render(self.error_message[:50], True, TEXT_ON_DARK)
            error_text_rect = error_surface.get_rect(center=error_rect.center)
            self.screen.blit(error_surface, error_text_rect)
    
    def handle_mouse_click(self, pos: Tuple[int, int]):
        # Check if click is in grid area
        if pos[0] < GRID_AREA_WIDTH:
            # Find clicked node
            for node in self.nodes:
                distance = math.sqrt((pos[0] - node.x)**2 + (pos[1] - node.y)**2)
                if distance <= 20:
                    self.selected_node = node.id
                    return
            
            # If no node clicked, deselect
            self.selected_node = None
    
    def handle_mouse_drag(self, pos: Tuple[int, int]):
        if self.dragging_node is not None and self.dragging_node < len(self.nodes):
            # Update node position
            self.nodes[self.dragging_node].x = pos[0]
            self.nodes[self.dragging_node].y = pos[1]
    
    def is_connected(self) -> bool:
        if not self.nodes:
            return True
        
        # Use Union-Find to check connectivity
        uf = UnionFind(len(self.nodes))
        
        for edge in self.edges:
            if edge.active and self.nodes[edge.from_node].active and self.nodes[edge.to_node].active:
                uf.union(edge.from_node, edge.to_node)
        
        # Check if all active nodes are connected
        active_nodes = [i for i, node in enumerate(self.nodes) if node.active]
        if not active_nodes:
            return True
        
        root = uf.find(active_nodes[0])
        return all(uf.find(node_id) == root for node_id in active_nodes)
    
    def simulate_cascading_failures(self, load_increase_percent: float):
        """Simulate cascading failures with load increase"""
        if not self.nodes:
            return
        
        # Save original state
        self.save_state()
        
        # Apply load increase
        for node in self.nodes:
            if node.active:
                node.load *= (1 + load_increase_percent / 100)
        
        for edge in self.edges:
            if edge.active:
                edge.current_load *= (1 + load_increase_percent / 100)
        
        # Simulate cascading failures
        failures_occurred = True
        iteration = 0
        
        while failures_occurred and iteration < 10:  # Limit iterations
            failures_occurred = False
            iteration += 1
            
            # Check for overloaded nodes
            for node in self.nodes:
                if node.active and node.load >= node.max_capacity:
                    node.active = False
                    failures_occurred = True
                    self.failure_history.append(f"Node {node.name} failed (overload)")
            
            # Check for overloaded edges
            for edge in self.edges:
                if edge.active and edge.current_load >= edge.capacity:
                    edge.active = False
                    failures_occurred = True
                    from_name = self.nodes[edge.from_node].name
                    to_name = self.nodes[edge.to_node].name
                    self.failure_history.append(f"Edge {from_name}-{to_name} failed (overload)")
                    
                    # Redistribute load
                    self.redistribute_load(edge.from_node, edge.to_node, edge.current_load)
    
    def redistribute_load(self, from_node: int, to_node: int, failed_load: float):
        """Redistribute load from failed edge to remaining edges"""
        for node_id in [from_node, to_node]:
            if node_id >= len(self.nodes):
                continue
            
            # Find active edges from this node
            active_edges = []
            total_spare_capacity = 0
            
            for edge in self.edges:
                if edge.active and (edge.from_node == node_id or edge.to_node == node_id):
                    spare_capacity = edge.capacity - edge.current_load
                    if spare_capacity > 0:
                        active_edges.append(edge)
                        total_spare_capacity += spare_capacity
            
            # Redistribute load proportionally
            if total_spare_capacity > 0:
                redistribution_factor = min(1.0, failed_load / total_spare_capacity)
                for edge in active_edges:
                    spare_capacity = edge.capacity - edge.current_load
                    additional_load = redistribution_factor * spare_capacity
                    edge.current_load += additional_load
    
    def save_state(self):
        """Save current grid state"""
        self.original_state = {
            'nodes': [(n.load, n.active) for n in self.nodes],
            'edges': [(e.current_load, e.active) for e in self.edges]
        }
        self.failure_history.clear()
    
    def restore_state(self):
        """Restore grid to original state"""
        if self.original_state:
            for i, (load, active) in enumerate(self.original_state['nodes']):
                if i < len(self.nodes):
                    self.nodes[i].load = load
                    self.nodes[i].active = active
            
            for i, (current_load, active) in enumerate(self.original_state['edges']):
                if i < len(self.edges):
                    self.edges[i].current_load = current_load
                    self.edges[i].active = active
    
    def run(self):
        running = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:  # Left click
                        self.handle_mouse_click(event.pos)
                        
                        # Check if dragging a node
                        if self.selected_node is not None:
                            self.dragging_node = self.selected_node
                
                elif event.type == pygame.MOUSEBUTTONUP:
                    if event.button == 1:  # Left click
                        self.dragging_node = None
                
                elif event.type == pygame.MOUSEMOTION:
                    if self.dragging_node is not None:
                        self.handle_mouse_drag(event.pos)
                
                # Handle button clicks
                for name, button in self.buttons.items():
                    if button.handle_event(event):
                        if name == 'reset':
                            self.restore_state()
                        elif name == 'simulate':
                            try:
                                load_increase_text = self.input_boxes['load_increase'].text.strip()
                                if not load_increase_text:
                                    self.error_message = "Please enter a load increase percentage"
                                    self.error_timer = 0
                                else:
                                    load_increase = float(load_increase_text)
                                    if load_increase < 0:
                                        self.error_message = "Load increase must be positive"
                                        self.error_timer = 0
                                    else:
                                        self.simulate_cascading_failures(load_increase)
                                        self.error_message = ""
                            except ValueError:
                                self.error_message = "Invalid number format for load increase"
                                self.error_timer = 0
                        elif name == 'increase_load':
                            try:
                                load_increase_text = self.input_boxes['load_increase'].text.strip()
                                if not load_increase_text:
                                    self.error_message = "Please enter a load increase percentage"
                                    self.error_timer = 0
                                else:
                                    load_increase = float(load_increase_text)
                                    if load_increase < 0:
                                        self.error_message = "Load increase must be positive"
                                        self.error_timer = 0
                                    else:
                                        for node in self.nodes:
                                            if node.active:
                                                node.load *= (1 + load_increase / 100)
                                        for edge in self.edges:
                                            if edge.active:
                                                edge.current_load *= (1 + load_increase / 100)
                                        self.error_message = ""
                            except ValueError:
                                self.error_message = "Invalid number format for load increase"
                                self.error_timer = 0
                        elif name == 'demo_stable':
                            self.load_demo_scenario(0)
                            self.input_boxes['load_increase'].text = str(self.demo_scenarios[0]['test_load_increase'])
                        elif name == 'demo_overload':
                            self.load_demo_scenario(1)
                            self.input_boxes['load_increase'].text = str(self.demo_scenarios[1]['test_load_increase'])
                        elif name == 'demo_cascade':
                            self.load_demo_scenario(2)
                            self.input_boxes['load_increase'].text = str(self.demo_scenarios[2]['test_load_increase'])
                        elif name == 'toggle_info':
                            self.show_node_info = not self.show_node_info
                            self.show_edge_info = not self.show_edge_info
                        elif name == 'add_node':
                            # Add a new node at random position
                            x = random.randint(GRID_MARGIN + 50, GRID_AREA_WIDTH - GRID_MARGIN - 50)
                            y = random.randint(GRID_MARGIN + 50, GRID_AREA_HEIGHT - GRID_MARGIN - 50)
                            load = random.uniform(50, 100)
                            capacity = load * random.uniform(1.5, 2.0)
                            new_node = Node(len(self.nodes), f"Station-{len(self.nodes)+1}", x, y, load, capacity)
                            self.nodes.append(new_node)
                
                # Handle input box events
                for input_box in self.input_boxes.values():
                    input_box.handle_event(event)
            
            # Update input boxes for cursor blinking
            current_time = pygame.time.get_ticks()
            dt = current_time - self.last_update_time
            self.last_update_time = current_time
            
            for input_box in self.input_boxes.values():
                input_box.update(dt)
            
            # Clear error messages after 3 seconds
            if self.error_message and self.error_timer > 3000:
                self.error_message = ""
                self.error_timer = 0
            elif self.error_message:
                self.error_timer += dt
            
            # Clear screen
            self.screen.fill(WHITE)
            
            # Draw everything
            self.draw_grid()
            self.draw_control_panel()
            
            # Update display
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()

def main():
    simulator = ElectricGridSimulator()
    simulator.run()

if __name__ == "__main__":
    main()
