/**
 * SINGULARIS PRIME Glyph Space Manager
 * 
 * This module manages multi-dimensional glyph spaces, providing spatial
 * indexing, navigation, and transformation capabilities for complex
 * glyph arrangements in N-dimensional coordinate systems.
 * 
 * Key features:
 * - N-dimensional coordinate systems and transformations
 * - Spatial relationship management and proximity queries
 * - Dimensional projection and embedding operations
 * - Hierarchical space nesting and inheritance
 * - Efficient spatial indexing and search algorithms
 * - Integration with quantum memory management
 */

import { EventEmitter } from 'events';
import {
  GlyphSpaceDimension,
  GlyphSpace,
  GlyphInstance,
  GlyphDefinition
} from '../../shared/schema';

import {
  QuantumReferenceId,
  generateQuantumReferenceId
} from '../../shared/types/quantum-types';

import {
  ExplainabilityScore,
  isHighExplainability
} from '../../shared/types/ai-types';

import {
  GlyphId,
  GlyphInstanceId,
  GlyphSpaceId,
  GlyphStructure
} from './advanced-glyph-engine';

// =============================================================================
// SPATIAL COORDINATE SYSTEM TYPES
// =============================================================================

// N-dimensional coordinate representation
export interface NDimensionalCoordinate {
  readonly dimensions: number;
  readonly coordinates: ReadonlyArray<number>;
  readonly coordinateSystem: CoordinateSystemType;
  readonly metadata?: CoordinateMetadata;
  
  // Type-level coordinate constraint
  readonly __ndCoordinate: unique symbol;
}

export type CoordinateSystemType = 
  | 'cartesian'
  | 'polar' 
  | 'spherical'
  | 'cylindrical'
  | 'hyperspherical'
  | 'manifold'
  | 'custom';

export interface CoordinateMetadata {
  readonly precision: number; // Decimal precision for coordinates
  readonly bounds?: CoordinateBounds;
  readonly units?: string;
  readonly referenceFrame?: string;
  readonly transformationHistory?: ReadonlyArray<CoordinateTransformation>;
}

export interface CoordinateBounds {
  readonly min: ReadonlyArray<number>;
  readonly max: ReadonlyArray<number>;
  readonly periodic?: ReadonlyArray<boolean>; // Which dimensions are periodic
  readonly boundaryConditions?: ReadonlyArray<'open' | 'closed' | 'periodic'>;
}

// Coordinate transformation operations
export interface CoordinateTransformation {
  readonly id: string;
  readonly type: 'linear' | 'affine' | 'nonlinear' | 'projection' | 'embedding';
  readonly sourceDimensions: number;
  readonly targetDimensions: number;
  readonly matrix?: ReadonlyArray<ReadonlyArray<number>>; // For linear transformations
  readonly parameters: Record<string, any>;
  readonly inverse?: CoordinateTransformation;
  readonly preservedProperties: ReadonlyArray<string>;
  readonly jacobianDeterminant?: number; // For volume preservation analysis
}

// =============================================================================
// SPATIAL RELATIONSHIP TYPES
// =============================================================================

// Spatial relationships between glyph instances
export interface SpatialRelationship {
  readonly id: string;
  readonly sourceInstanceId: GlyphInstanceId;
  readonly targetInstanceId: GlyphInstanceId;
  readonly relationshipType: SpatialRelationshipType;
  readonly distance: number;
  readonly direction?: NDimensionalCoordinate; // Unit vector from source to target
  readonly strength: number; // 0-1 relationship strength
  readonly properties: SpatialRelationshipProperties;
  readonly metadata: RelationshipMetadata;
}

export type SpatialRelationshipType =
  | 'neighbor'           // Spatial neighbors within threshold
  | 'contained'          // One glyph contains another
  | 'intersects'         // Glyphs intersect spatially
  | 'aligned'            // Glyphs are aligned along dimension
  | 'parallel'           // Parallel orientation
  | 'perpendicular'      // Perpendicular orientation
  | 'clustered'          // Part of spatial cluster
  | 'quantum_entangled'  // Connected via quantum entanglement
  | 'hierarchical'       // Parent-child relationship
  | 'custom';            // Custom relationship type

export interface SpatialRelationshipProperties {
  readonly symmetric: boolean; // Is relationship symmetric?
  readonly transitive: boolean; // Is relationship transitive?
  readonly temporal: boolean; // Does relationship change over time?
  readonly quantum: boolean; // Is relationship quantum-mediated?
  readonly constraintForces?: ReadonlyArray<ConstraintForce>; // Physical constraints
  readonly interactionRadius?: number; // Effective interaction radius
}

export interface ConstraintForce {
  readonly type: 'attractive' | 'repulsive' | 'constraint' | 'alignment';
  readonly magnitude: number;
  readonly direction?: NDimensionalCoordinate;
  readonly falloffRate: number; // How quickly force decreases with distance
  readonly active: boolean;
}

export interface RelationshipMetadata {
  readonly created: number;
  readonly lastUpdated: number;
  readonly updateCount: number;
  readonly computationCost: number; // Cost to maintain this relationship
  readonly accuracy: number; // 0-1 accuracy of relationship calculation
  readonly explainabilityScore: ExplainabilityScore;
}

// =============================================================================
// GLYPH SPACE DEFINITION
// =============================================================================

// Multi-dimensional glyph space structure
export interface GlyphSpaceStructure {
  readonly id: GlyphSpaceId;
  readonly name: string;
  readonly dimensions: number;
  readonly topology: SpaceTopology;
  readonly metricProperties: SpaceMetricProperties;
  readonly coordinateSystem: CoordinateSystemType;
  readonly bounds: CoordinateBounds;
  readonly resolution: SpatialResolution;
  readonly hierarchy: SpaceHierarchy;
  readonly indexingStrategy: SpatialIndexingStrategy;
  readonly performance: SpacePerformanceMetrics;
  readonly metadata: SpaceMetadata;
  
  // Type-level space constraint
  readonly __glyphSpace: unique symbol;
}

export type SpaceTopology = 
  | 'euclidean'      // Flat Euclidean space
  | 'spherical'      // Spherical topology
  | 'hyperbolic'     // Hyperbolic geometry
  | 'torus'          // Toroidal topology
  | 'klein_bottle'   // Klein bottle topology
  | 'manifold'       // General differentiable manifold
  | 'quantum_space'  // Quantum geometric space
  | 'fractal';       // Fractal dimension space

export interface SpaceMetricProperties {
  readonly metricTensor?: ReadonlyArray<ReadonlyArray<number>>; // Metric tensor for curved spaces
  readonly curvature?: CurvatureProperties;
  readonly connectionCoefficients?: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>; // Christoffel symbols
  readonly isometries?: ReadonlyArray<CoordinateTransformation>; // Symmetry transformations
  readonly geodesics?: GeodesicProperties; // Properties of shortest paths
}

export interface CurvatureProperties {
  readonly scalar: number; // Scalar curvature
  readonly ricci?: ReadonlyArray<ReadonlyArray<number>>; // Ricci tensor
  readonly riemann?: ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>>; // Riemann tensor
  readonly sectional?: ReadonlyArray<number>; // Sectional curvatures
  readonly constant: boolean; // Is curvature constant?
}

export interface GeodesicProperties {
  readonly complete: boolean; // Are geodesics complete?
  readonly uniqueness: boolean; // Unique geodesics between points?
  readonly conjugatePoints?: ReadonlyArray<NDimensionalCoordinate>;
  readonly cutLocus?: ReadonlyArray<NDimensionalCoordinate>;
}

export interface SpatialResolution {
  readonly baseResolution: ReadonlyArray<number>; // Resolution per dimension
  readonly adaptiveResolution: boolean; // Adaptive resolution based on glyph density
  readonly maxResolution: ReadonlyArray<number>; // Maximum resolution limits
  readonly minResolution: ReadonlyArray<number>; // Minimum resolution limits
  readonly lodLevels: number; // Number of level-of-detail levels
}

export interface SpaceHierarchy {
  readonly parentSpaceId?: GlyphSpaceId;
  readonly childSpaceIds: ReadonlyArray<GlyphSpaceId>;
  readonly transformToParent?: CoordinateTransformation;
  readonly transformFromParent?: CoordinateTransformation;
  readonly inheritanceRules: HierarchyInheritanceRules;
  readonly nesting: SpaceNestingProperties;
}

export interface HierarchyInheritanceRules {
  readonly inheritCoordinateSystem: boolean;
  readonly inheritTopology: boolean;
  readonly inheritMetric: boolean;
  readonly inheritBounds: boolean;
  readonly inheritIndexing: boolean;
  readonly customRules?: Record<string, any>;
}

export interface SpaceNestingProperties {
  readonly maxNestingDepth: number;
  readonly nestingType: 'contained' | 'overlapping' | 'projected' | 'quantum_linked';
  readonly nestingConstraints: ReadonlyArray<NestingConstraint>;
  readonly nestingTransformations: ReadonlyArray<CoordinateTransformation>;
}

export interface NestingConstraint {
  readonly type: 'dimensional' | 'topological' | 'metric' | 'quantum';
  readonly constraint: string;
  readonly parameters: Record<string, any>;
  readonly enforced: boolean;
  readonly violationHandling: 'warn' | 'correct' | 'reject';
}

// =============================================================================
// SPATIAL INDEXING AND SEARCH
// =============================================================================

// Spatial indexing strategies for efficient queries
export interface SpatialIndexingStrategy {
  readonly type: SpatialIndexType;
  readonly parameters: IndexingParameters;
  readonly performance: IndexingPerformanceMetrics;
  readonly adaptiveParameters: boolean;
  readonly memoryUsage: number; // Bytes
  readonly rebuildThreshold: number; // Fraction of changes before rebuild
}

export type SpatialIndexType =
  | 'octree'         // Octree for 3D spaces
  | 'kdtree'         // K-d tree for general dimensions
  | 'rtree'          // R-tree for rectangular regions
  | 'quadtree'       // Quadtree for 2D spaces
  | 'hash_grid'      // Spatial hash grid
  | 'bsp_tree'       // Binary space partitioning tree
  | 'voronoi'        // Voronoi diagram based
  | 'quantum_index'  // Quantum-enhanced indexing
  | 'fractal_index'  // Fractal-based indexing
  | 'custom';        // Custom indexing strategy

export interface IndexingParameters {
  readonly maxDepth?: number;
  readonly maxObjectsPerNode?: number;
  readonly splitThreshold?: number;
  readonly mergeThreshold?: number;
  readonly gridSize?: ReadonlyArray<number>;
  readonly adaptiveGrid?: boolean;
  readonly quantumCoherent?: boolean; // For quantum indexing
  readonly customParameters?: Record<string, any>;
}

export interface IndexingPerformanceMetrics {
  readonly buildTime: number; // microseconds
  readonly queryTime: number; // microseconds per query
  readonly updateTime: number; // microseconds per update
  readonly memoryEfficiency: number; // 0-1 efficiency score
  readonly spatialEfficiency: number; // 0-1 spatial coverage efficiency
  readonly cacheHitRate: number; // 0-1 cache hit rate
  readonly lastOptimized: number;
}

// Spatial search and query operations
export interface SpatialQuery {
  readonly id: string;
  readonly queryType: SpatialQueryType;
  readonly searchRegion: SearchRegion;
  readonly filters: ReadonlyArray<SpatialFilter>;
  readonly sortCriteria?: SpatialSortCriteria;
  readonly maxResults?: number;
  readonly explainabilityRequired: boolean;
}

export type SpatialQueryType =
  | 'point_query'           // Find objects at specific point
  | 'range_query'           // Find objects within range
  | 'nearest_neighbor'      // Find k nearest neighbors
  | 'intersection_query'    // Find intersecting objects
  | 'containment_query'     // Find containing/contained objects
  | 'path_query'            // Find objects along path
  | 'cluster_query'         // Find clustered objects
  | 'quantum_correlated';   // Find quantum-correlated objects

export interface SearchRegion {
  readonly type: 'sphere' | 'box' | 'polytope' | 'manifold_region' | 'quantum_region';
  readonly center?: NDimensionalCoordinate;
  readonly radius?: number;
  readonly bounds?: CoordinateBounds;
  readonly vertices?: ReadonlyArray<NDimensionalCoordinate>;
  readonly quantumState?: QuantumReferenceId;
  readonly customGeometry?: Record<string, any>;
}

export interface SpatialFilter {
  readonly type: 'glyph_type' | 'relationship' | 'property' | 'quantum_state' | 'temporal';
  readonly condition: string;
  readonly parameters: Record<string, any>;
  readonly include: boolean; // true for include, false for exclude
}

export interface SpatialSortCriteria {
  readonly sortBy: 'distance' | 'size' | 'complexity' | 'quantum_correlation' | 'custom';
  readonly ascending: boolean;
  readonly customComparator?: (a: GlyphInstanceId, b: GlyphInstanceId) => number;
}

export interface SpatialQueryResult {
  readonly success: boolean;
  readonly results: ReadonlyArray<SpatialQueryResultItem>;
  readonly totalFound: number;
  readonly queryTime: number; // microseconds
  readonly explainabilityScore: ExplainabilityScore;
  readonly spatialRelevance: number; // 0-1 relevance score
}

export interface SpatialQueryResultItem {
  readonly instanceId: GlyphInstanceId;
  readonly position: NDimensionalCoordinate;
  readonly distance?: number; // Distance from query center
  readonly relevanceScore: number; // 0-1 relevance to query
  readonly relationships: ReadonlyArray<SpatialRelationship>;
  readonly metadata: Record<string, any>;
}

// =============================================================================
// GLYPH SPACE EVENTS
// =============================================================================

export interface GlyphSpaceEvent {
  readonly timestamp: number;
  readonly spaceId: GlyphSpaceId;
  readonly eventType: 'instance_added' | 'instance_removed' | 'instance_moved' | 'relationship_created' | 'relationship_updated' | 'space_transformed' | 'index_rebuilt' | 'optimization';
  readonly details: SpaceEventDetails;
}

export interface SpaceEventDetails {
  readonly instanceId?: GlyphInstanceId;
  readonly oldPosition?: NDimensionalCoordinate;
  readonly newPosition?: NDimensionalCoordinate;
  readonly relationshipId?: string;
  readonly transformationId?: string;
  readonly performanceImpact?: number;
  readonly affectedInstances?: ReadonlyArray<GlyphInstanceId>;
}

// =============================================================================
// SPACE PERFORMANCE METRICS
// =============================================================================

export interface SpacePerformanceMetrics {
  readonly glyphCount: number;
  readonly relationshipCount: number;
  readonly averageQueryTime: number; // microseconds
  readonly indexEfficiency: number; // 0-1
  readonly memoryUsage: number; // bytes
  readonly spatialDensity: number; // glyphs per unit volume
  readonly optimizationScore: number; // 0-1
  readonly lastOptimized: number;
  readonly hotspots: ReadonlyArray<SpatialHotspot>; // High-activity regions
}

export interface SpatialHotspot {
  readonly region: SearchRegion;
  readonly activityLevel: number; // 0-1
  readonly glyphDensity: number;
  readonly accessFrequency: number;
  readonly optimizationRecommendation?: string;
}

export interface SpaceMetadata {
  readonly version: string;
  readonly created: number;
  readonly modified: number;
  readonly author?: string;
  readonly description?: string;
  readonly tags: ReadonlySet<string>;
  readonly usagePattern: SpaceUsagePattern;
  readonly optimizationHistory: ReadonlyArray<OptimizationRecord>;
}

export interface SpaceUsagePattern {
  readonly accessPattern: 'sequential' | 'random' | 'clustered' | 'temporal' | 'quantum_coherent';
  readonly queryTypes: ReadonlyArray<SpatialQueryType>;
  readonly updateFrequency: number; // Updates per second
  readonly readWriteRatio: number; // Read/write ratio
  readonly peakUsageHours: ReadonlyArray<number>; // Hours of peak usage
}

export interface OptimizationRecord {
  readonly timestamp: number;
  readonly optimizationType: 'index_rebuild' | 'space_restructure' | 'resolution_adjust' | 'hierarchy_optimize';
  readonly performanceGain: number; // Percentage improvement
  readonly parameters: Record<string, any>;
  readonly duration: number; // microseconds
}

// =============================================================================
// CORE GLYPH SPACE MANAGER IMPLEMENTATION
// =============================================================================

export class GlyphSpaceManager extends EventEmitter {
  private static instance: GlyphSpaceManager | null = null;
  
  // State management
  private isInitialized: boolean = false;
  private spaceRegistry: Map<GlyphSpaceId, GlyphSpaceStructure> = new Map();
  private instancePositions: Map<GlyphInstanceId, NDimensionalCoordinate> = new Map();
  private spatialRelationships: Map<string, SpatialRelationship> = new Map();
  private spatialIndices: Map<GlyphSpaceId, SpatialIndex> = new Map();
  private activeQueries: Map<string, SpatialQuery> = new Map();
  
  // Performance tracking
  private performanceMetrics = {
    totalSpaces: 0,
    totalInstances: 0,
    totalRelationships: 0,
    averageQueryTime: 0,
    indexEfficiency: 0.95,
    memoryUsage: 0,
    optimizationScore: 0.85
  };
  
  // Configuration
  private readonly config = {
    defaultIndexType: 'kdtree' as SpatialIndexType,
    maxSpaceNestingDepth: 10,
    defaultResolution: [1.0, 1.0, 1.0],
    relationshipThreshold: 10.0, // Default neighbor threshold
    enableRealTimeOptimization: true,
    enableQuantumSpatialCorrelation: true,
    maxCachedQueries: 1000,
    indexRebuildThreshold: 0.3 // Rebuild when 30% of objects change
  };
  
  constructor() {
    super();
    this.setupPerformanceMonitoring();
  }
  
  public static getInstance(): GlyphSpaceManager {
    if (!GlyphSpaceManager.instance) {
      GlyphSpaceManager.instance = new GlyphSpaceManager();
    }
    return GlyphSpaceManager.instance;
  }
  
  /**
   * Initialize the glyph space manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      this.isInitialized = true;
      this.emit('manager_initialized', { timestamp: Date.now() });
      
    } catch (error) {
      this.isInitialized = false;
      throw new Error(`Failed to initialize glyph space manager: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // =============================================================================
  // GLYPH SPACE CREATION AND MANAGEMENT
  // =============================================================================
  
  /**
   * Create a new glyph space
   */
  public async createGlyphSpace(spaceSpec: Omit<GlyphSpaceStructure, 'id' | 'performance' | 'metadata'>): Promise<GlyphSpaceId> {
    this.validateSpaceSpec(spaceSpec);
    
    const spaceId = this.generateSpaceId();
    
    // Check hierarchy constraints if this is a nested space
    if (spaceSpec.hierarchy.parentSpaceId) {
      await this.validateSpaceHierarchy(spaceSpec.hierarchy);
    }
    
    const space: GlyphSpaceStructure = {
      id: spaceId,
      ...spaceSpec,
      performance: {
        glyphCount: 0,
        relationshipCount: 0,
        averageQueryTime: 0,
        indexEfficiency: 1.0,
        memoryUsage: 0,
        spatialDensity: 0,
        optimizationScore: 1.0,
        lastOptimized: Date.now(),
        hotspots: []
      },
      metadata: {
        version: '1.0.0',
        created: Date.now(),
        modified: Date.now(),
        tags: new Set(),
        usagePattern: {
          accessPattern: 'random',
          queryTypes: [],
          updateFrequency: 0,
          readWriteRatio: 1.0,
          peakUsageHours: []
        },
        optimizationHistory: []
      }
    };
    
    // Create spatial index for the space
    await this.createSpatialIndex(spaceId, space);
    
    this.spaceRegistry.set(spaceId, space);
    
    this.emit('space_created', {
      spaceId: spaceId,
      dimensions: space.dimensions,
      topology: space.topology,
      timestamp: Date.now()
    });
    
    return spaceId;
  }
  
  /**
   * Get glyph space by ID
   */
  public getGlyphSpace(spaceId: GlyphSpaceId): GlyphSpaceStructure | undefined {
    return this.spaceRegistry.get(spaceId);
  }
  
  /**
   * Update glyph space properties
   */
  public async updateGlyphSpace(spaceId: GlyphSpaceId, updates: Partial<GlyphSpaceStructure>): Promise<void> {
    const existingSpace = this.spaceRegistry.get(spaceId);
    if (!existingSpace) {
      throw new Error(`Glyph space ${spaceId} not found`);
    }
    
    const updatedSpace: GlyphSpaceStructure = {
      ...existingSpace,
      ...updates,
      metadata: {
        ...existingSpace.metadata,
        ...updates.metadata,
        modified: Date.now()
      }
    };
    
    this.validateSpaceSpec(updatedSpace);
    
    // Rebuild spatial index if indexing strategy changed
    if (updates.indexingStrategy && updates.indexingStrategy !== existingSpace.indexingStrategy) {
      await this.rebuildSpatialIndex(spaceId, updatedSpace);
    }
    
    this.spaceRegistry.set(spaceId, updatedSpace);
    
    this.emit('space_updated', {
      spaceId: spaceId,
      changes: Object.keys(updates),
      timestamp: Date.now()
    });
  }
  
  /**
   * Remove glyph space
   */
  public async removeGlyphSpace(spaceId: GlyphSpaceId): Promise<void> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space) {
      throw new Error(`Glyph space ${spaceId} not found`);
    }
    
    // Check for child spaces
    if (space.hierarchy.childSpaceIds.length > 0) {
      throw new Error(`Cannot remove space ${spaceId}: has child spaces`);
    }
    
    // Remove all instances from the space
    const instances = this.getInstancesInSpace(spaceId);
    for (const instanceId of instances) {
      await this.removeInstanceFromSpace(spaceId, instanceId);
    }
    
    // Clean up spatial index
    this.spatialIndices.delete(spaceId);
    this.spaceRegistry.delete(spaceId);
    
    this.emit('space_removed', {
      spaceId: spaceId,
      timestamp: Date.now()
    });
  }
  
  // =============================================================================
  // GLYPH INSTANCE POSITIONING
  // =============================================================================
  
  /**
   * Add glyph instance to space at specified position
   */
  public async addInstanceToSpace(spaceId: GlyphSpaceId, instanceId: GlyphInstanceId, position: NDimensionalCoordinate): Promise<void> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space) {
      throw new Error(`Glyph space ${spaceId} not found`);
    }
    
    this.validateCoordinate(position, space);
    
    // Check if instance is already in a space
    if (this.instancePositions.has(instanceId)) {
      throw new Error(`Instance ${instanceId} is already positioned in a space`);
    }
    
    // Add to spatial index
    const spatialIndex = this.spatialIndices.get(spaceId);
    if (spatialIndex) {
      await spatialIndex.insert(instanceId, position);
    }
    
    this.instancePositions.set(instanceId, position);
    
    // Update relationships
    await this.updateSpatialRelationships(spaceId, instanceId);
    
    // Update space performance metrics
    await this.updateSpaceMetrics(spaceId);
    
    this.emit('instance_added', {
      spaceId: spaceId,
      instanceId: instanceId,
      position: position,
      timestamp: Date.now()
    });
  }
  
  /**
   * Move glyph instance to new position
   */
  public async moveInstance(spaceId: GlyphSpaceId, instanceId: GlyphInstanceId, newPosition: NDimensionalCoordinate): Promise<void> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space) {
      throw new Error(`Glyph space ${spaceId} not found`);
    }
    
    const oldPosition = this.instancePositions.get(instanceId);
    if (!oldPosition) {
      throw new Error(`Instance ${instanceId} not found in space`);
    }
    
    this.validateCoordinate(newPosition, space);
    
    // Update spatial index
    const spatialIndex = this.spatialIndices.get(spaceId);
    if (spatialIndex) {
      await spatialIndex.move(instanceId, oldPosition, newPosition);
    }
    
    this.instancePositions.set(instanceId, newPosition);
    
    // Update relationships
    await this.updateSpatialRelationships(spaceId, instanceId);
    
    this.emit('instance_moved', {
      spaceId: spaceId,
      instanceId: instanceId,
      oldPosition: oldPosition,
      newPosition: newPosition,
      timestamp: Date.now()
    });
  }
  
  /**
   * Remove instance from space
   */
  public async removeInstanceFromSpace(spaceId: GlyphSpaceId, instanceId: GlyphInstanceId): Promise<void> {
    const position = this.instancePositions.get(instanceId);
    if (!position) {
      throw new Error(`Instance ${instanceId} not found in space`);
    }
    
    // Remove from spatial index
    const spatialIndex = this.spatialIndices.get(spaceId);
    if (spatialIndex) {
      await spatialIndex.remove(instanceId);
    }
    
    this.instancePositions.delete(instanceId);
    
    // Remove related spatial relationships
    await this.removeSpatialRelationships(instanceId);
    
    // Update space performance metrics
    await this.updateSpaceMetrics(spaceId);
    
    this.emit('instance_removed', {
      spaceId: spaceId,
      instanceId: instanceId,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get instance position
   */
  public getInstancePosition(instanceId: GlyphInstanceId): NDimensionalCoordinate | undefined {
    return this.instancePositions.get(instanceId);
  }
  
  /**
   * Get all instances in space
   */
  public getInstancesInSpace(spaceId: GlyphSpaceId): ReadonlyArray<GlyphInstanceId> {
    const instances: GlyphInstanceId[] = [];
    
    for (const [instanceId, position] of this.instancePositions) {
      // Check if instance belongs to this space (simplified check)
      const spatialIndex = this.spatialIndices.get(spaceId);
      if (spatialIndex && spatialIndex.contains(instanceId)) {
        instances.push(instanceId);
      }
    }
    
    return instances;
  }
  
  // =============================================================================
  // SPATIAL QUERIES AND SEARCH
  // =============================================================================
  
  /**
   * Execute spatial query
   */
  public async executeSpatialQuery(spaceId: GlyphSpaceId, query: SpatialQuery): Promise<SpatialQueryResult> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space) {
      throw new Error(`Glyph space ${spaceId} not found`);
    }
    
    const startTime = Date.now();
    this.activeQueries.set(query.id, query);
    
    try {
      const spatialIndex = this.spatialIndices.get(spaceId);
      if (!spatialIndex) {
        throw new Error(`No spatial index for space ${spaceId}`);
      }
      
      // Execute the query based on type
      const rawResults = await this.executeQueryInternal(spatialIndex, query);
      
      // Apply filters
      const filteredResults = await this.applyQueryFilters(rawResults, query.filters);
      
      // Sort results
      const sortedResults = await this.sortQueryResults(filteredResults, query.sortCriteria);
      
      // Limit results
      const finalResults = query.maxResults ? 
        sortedResults.slice(0, query.maxResults) : 
        sortedResults;
      
      const queryTime = Date.now() - startTime;
      
      const result: SpatialQueryResult = {
        success: true,
        results: finalResults,
        totalFound: rawResults.length,
        queryTime: queryTime,
        explainabilityScore: this.calculateQueryExplainability(query, finalResults),
        spatialRelevance: this.calculateSpatialRelevance(query, finalResults)
      };
      
      // Update space usage patterns
      await this.updateSpaceUsagePattern(spaceId, query);
      
      this.emit('query_executed', {
        spaceId: spaceId,
        queryId: query.id,
        queryType: query.queryType,
        resultCount: finalResults.length,
        queryTime: queryTime,
        timestamp: Date.now()
      });
      
      return result;
      
    } finally {
      this.activeQueries.delete(query.id);
    }
  }
  
  /**
   * Find nearest neighbors to a point
   */
  public async findNearestNeighbors(spaceId: GlyphSpaceId, center: NDimensionalCoordinate, k: number, maxDistance?: number): Promise<SpatialQueryResult> {
    const query: SpatialQuery = {
      id: this.generateQueryId(),
      queryType: 'nearest_neighbor',
      searchRegion: {
        type: 'sphere',
        center: center,
        radius: maxDistance || Number.MAX_VALUE
      },
      filters: [],
      maxResults: k,
      explainabilityRequired: false
    };
    
    return this.executeSpatialQuery(spaceId, query);
  }
  
  /**
   * Find instances in spatial range
   */
  public async findInstancesInRange(spaceId: GlyphSpaceId, center: NDimensionalCoordinate, radius: number): Promise<SpatialQueryResult> {
    const query: SpatialQuery = {
      id: this.generateQueryId(),
      queryType: 'range_query',
      searchRegion: {
        type: 'sphere',
        center: center,
        radius: radius
      },
      filters: [],
      explainabilityRequired: false
    };
    
    return this.executeSpatialQuery(spaceId, query);
  }
  
  // =============================================================================
  // COORDINATE TRANSFORMATIONS
  // =============================================================================
  
  /**
   * Transform coordinate between different systems
   */
  public async transformCoordinate(coordinate: NDimensionalCoordinate, transformation: CoordinateTransformation): Promise<NDimensionalCoordinate> {
    this.validateTransformation(transformation, coordinate);
    
    const transformedCoords = await this.applyCoordinateTransformation(coordinate, transformation);
    
    return {
      dimensions: transformation.targetDimensions,
      coordinates: transformedCoords,
      coordinateSystem: coordinate.coordinateSystem, // May need to be updated based on transformation
      metadata: {
        ...coordinate.metadata,
        transformationHistory: [
          ...(coordinate.metadata?.transformationHistory || []),
          transformation
        ]
      },
      __ndCoordinate: Symbol('ndCoordinate')
    };
  }
  
  /**
   * Project coordinate to lower dimensional space
   */
  public async projectCoordinate(coordinate: NDimensionalCoordinate, targetDimensions: number, projectionType: 'orthogonal' | 'perspective' | 'stereographic' = 'orthogonal'): Promise<NDimensionalCoordinate> {
    if (targetDimensions >= coordinate.dimensions) {
      throw new Error('Target dimensions must be less than source dimensions for projection');
    }
    
    const transformation = this.createProjectionTransformation(coordinate.dimensions, targetDimensions, projectionType);
    return this.transformCoordinate(coordinate, transformation);
  }
  
  /**
   * Embed coordinate in higher dimensional space
   */
  public async embedCoordinate(coordinate: NDimensionalCoordinate, targetDimensions: number, embeddingType: 'natural' | 'isometric' | 'conformal' = 'natural'): Promise<NDimensionalCoordinate> {
    if (targetDimensions <= coordinate.dimensions) {
      throw new Error('Target dimensions must be greater than source dimensions for embedding');
    }
    
    const transformation = this.createEmbeddingTransformation(coordinate.dimensions, targetDimensions, embeddingType);
    return this.transformCoordinate(coordinate, transformation);
  }
  
  // =============================================================================
  // SPATIAL RELATIONSHIPS
  // =============================================================================
  
  /**
   * Create spatial relationship between instances
   */
  public async createSpatialRelationship(sourceInstanceId: GlyphInstanceId, targetInstanceId: GlyphInstanceId, relationshipType: SpatialRelationshipType, properties?: Partial<SpatialRelationshipProperties>): Promise<string> {
    const sourcePosition = this.instancePositions.get(sourceInstanceId);
    const targetPosition = this.instancePositions.get(targetInstanceId);
    
    if (!sourcePosition || !targetPosition) {
      throw new Error('Both instances must be positioned in space');
    }
    
    const relationshipId = this.generateRelationshipId();
    const distance = this.calculateDistance(sourcePosition, targetPosition);
    const direction = this.calculateDirection(sourcePosition, targetPosition);
    
    const relationship: SpatialRelationship = {
      id: relationshipId,
      sourceInstanceId: sourceInstanceId,
      targetInstanceId: targetInstanceId,
      relationshipType: relationshipType,
      distance: distance,
      direction: direction,
      strength: this.calculateRelationshipStrength(distance, relationshipType),
      properties: {
        symmetric: false,
        transitive: false,
        temporal: false,
        quantum: false,
        ...properties
      },
      metadata: {
        created: Date.now(),
        lastUpdated: Date.now(),
        updateCount: 0,
        computationCost: this.estimateRelationshipCost(relationshipType),
        accuracy: 1.0,
        explainabilityScore: 0.95 as ExplainabilityScore
      }
    };
    
    this.spatialRelationships.set(relationshipId, relationship);
    
    this.emit('relationship_created', {
      relationshipId: relationshipId,
      sourceInstanceId: sourceInstanceId,
      targetInstanceId: targetInstanceId,
      relationshipType: relationshipType,
      timestamp: Date.now()
    });
    
    return relationshipId;
  }
  
  /**
   * Get spatial relationships for instance
   */
  public getSpatialRelationships(instanceId: GlyphInstanceId, relationshipType?: SpatialRelationshipType): ReadonlyArray<SpatialRelationship> {
    const relationships: SpatialRelationship[] = [];
    
    for (const relationship of this.spatialRelationships.values()) {
      if ((relationship.sourceInstanceId === instanceId || relationship.targetInstanceId === instanceId) &&
          (!relationshipType || relationship.relationshipType === relationshipType)) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }
  
  // =============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // =============================================================================
  
  private setupPerformanceMonitoring(): void {
    setInterval(() => {
      this.updateGlobalPerformanceMetrics();
    }, 10000); // Update every 10 seconds
  }
  
  private validateSpaceSpec(spaceSpec: any): void {
    if (!spaceSpec.name || !spaceSpec.dimensions || !spaceSpec.topology) {
      throw new Error('Invalid space specification: missing required fields');
    }
    
    if (spaceSpec.dimensions < 1 || spaceSpec.dimensions > 100) {
      throw new Error('Space dimensions must be between 1 and 100');
    }
  }
  
  private async validateSpaceHierarchy(hierarchy: SpaceHierarchy): Promise<void> {
    if (hierarchy.parentSpaceId) {
      const parentSpace = this.spaceRegistry.get(hierarchy.parentSpaceId);
      if (!parentSpace) {
        throw new Error(`Parent space ${hierarchy.parentSpaceId} not found`);
      }
      
      // Check nesting depth
      const nestingDepth = await this.calculateNestingDepth(hierarchy.parentSpaceId);
      if (nestingDepth >= this.config.maxSpaceNestingDepth) {
        throw new Error(`Maximum nesting depth ${this.config.maxSpaceNestingDepth} exceeded`);
      }
    }
  }
  
  private async calculateNestingDepth(spaceId: GlyphSpaceId): Promise<number> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space || !space.hierarchy.parentSpaceId) {
      return 0;
    }
    
    return 1 + await this.calculateNestingDepth(space.hierarchy.parentSpaceId);
  }
  
  private validateCoordinate(coordinate: NDimensionalCoordinate, space: GlyphSpaceStructure): void {
    if (coordinate.dimensions !== space.dimensions) {
      throw new Error(`Coordinate dimensions ${coordinate.dimensions} do not match space dimensions ${space.dimensions}`);
    }
    
    // Check bounds
    const bounds = space.bounds;
    if (bounds) {
      for (let i = 0; i < coordinate.dimensions; i++) {
        const coord = coordinate.coordinates[i];
        if (coord < bounds.min[i] || coord > bounds.max[i]) {
          throw new Error(`Coordinate ${i} (${coord}) is outside space bounds [${bounds.min[i]}, ${bounds.max[i]}]`);
        }
      }
    }
  }
  
  private async createSpatialIndex(spaceId: GlyphSpaceId, space: GlyphSpaceStructure): Promise<void> {
    const indexType = space.indexingStrategy.type;
    const spatialIndex = new SpatialIndex(indexType, space.indexingStrategy.parameters);
    await spatialIndex.initialize(space.dimensions, space.bounds);
    this.spatialIndices.set(spaceId, spatialIndex);
  }
  
  private async rebuildSpatialIndex(spaceId: GlyphSpaceId, space: GlyphSpaceStructure): Promise<void> {
    // Remove old index
    this.spatialIndices.delete(spaceId);
    
    // Create new index
    await this.createSpatialIndex(spaceId, space);
    
    // Re-insert all instances
    const instances = this.getInstancesInSpace(spaceId);
    const spatialIndex = this.spatialIndices.get(spaceId)!;
    
    for (const instanceId of instances) {
      const position = this.instancePositions.get(instanceId);
      if (position) {
        await spatialIndex.insert(instanceId, position);
      }
    }
  }
  
  private async updateSpatialRelationships(spaceId: GlyphSpaceId, instanceId: GlyphInstanceId): Promise<void> {
    const position = this.instancePositions.get(instanceId);
    if (!position) return;
    
    // Find nearby instances for relationship creation
    const nearbyInstances = await this.findNearestNeighbors(spaceId, position, 10, this.config.relationshipThreshold);
    
    for (const result of nearbyInstances.results) {
      if (result.instanceId !== instanceId) {
        // Create neighbor relationship if within threshold
        if (result.distance !== undefined && result.distance <= this.config.relationshipThreshold) {
          await this.createSpatialRelationship(instanceId, result.instanceId, 'neighbor');
        }
      }
    }
  }
  
  private async removeSpatialRelationships(instanceId: GlyphInstanceId): Promise<void> {
    const relationshipsToRemove: string[] = [];
    
    for (const [relationshipId, relationship] of this.spatialRelationships) {
      if (relationship.sourceInstanceId === instanceId || relationship.targetInstanceId === instanceId) {
        relationshipsToRemove.push(relationshipId);
      }
    }
    
    for (const relationshipId of relationshipsToRemove) {
      this.spatialRelationships.delete(relationshipId);
    }
  }
  
  private async updateSpaceMetrics(spaceId: GlyphSpaceId): Promise<void> {
    const space = this.spaceRegistry.get(spaceId);
    if (!space) return;
    
    const instances = this.getInstancesInSpace(spaceId);
    const relationshipCount = Array.from(this.spatialRelationships.values())
      .filter(rel => instances.includes(rel.sourceInstanceId) || instances.includes(rel.targetInstanceId))
      .length;
    
    const updatedSpace: GlyphSpaceStructure = {
      ...space,
      performance: {
        ...space.performance,
        glyphCount: instances.length,
        relationshipCount: relationshipCount,
        spatialDensity: this.calculateSpatialDensity(space, instances.length)
      }
    };
    
    this.spaceRegistry.set(spaceId, updatedSpace);
  }
  
  private calculateSpatialDensity(space: GlyphSpaceStructure, instanceCount: number): number {
    // Calculate volume of space bounds
    const bounds = space.bounds;
    let volume = 1;
    
    for (let i = 0; i < space.dimensions; i++) {
      volume *= (bounds.max[i] - bounds.min[i]);
    }
    
    return instanceCount / volume;
  }
  
  private async executeQueryInternal(spatialIndex: SpatialIndex, query: SpatialQuery): Promise<SpatialQueryResultItem[]> {
    // Simplified implementation - would use actual spatial index methods
    const results: SpatialQueryResultItem[] = [];
    
    // This would be replaced with actual spatial index queries
    for (const [instanceId, position] of this.instancePositions) {
      if (this.matchesQueryRegion(position, query.searchRegion)) {
        results.push({
          instanceId: instanceId,
          position: position,
          distance: this.calculateDistanceToRegion(position, query.searchRegion),
          relevanceScore: 1.0,
          relationships: this.getSpatialRelationships(instanceId),
          metadata: {}
        });
      }
    }
    
    return results;
  }
  
  private matchesQueryRegion(position: NDimensionalCoordinate, searchRegion: SearchRegion): boolean {
    // Simplified region matching - would be more sophisticated
    if (searchRegion.type === 'sphere' && searchRegion.center && searchRegion.radius) {
      const distance = this.calculateDistance(position, searchRegion.center);
      return distance <= searchRegion.radius;
    }
    
    return false;
  }
  
  private calculateDistanceToRegion(position: NDimensionalCoordinate, searchRegion: SearchRegion): number {
    if (searchRegion.type === 'sphere' && searchRegion.center) {
      return this.calculateDistance(position, searchRegion.center);
    }
    
    return 0;
  }
  
  private async applyQueryFilters(results: SpatialQueryResultItem[], filters: ReadonlyArray<SpatialFilter>): Promise<SpatialQueryResultItem[]> {
    // Simplified filter application
    return results.filter(result => {
      return filters.every(filter => this.evaluateFilter(result, filter));
    });
  }
  
  private evaluateFilter(result: SpatialQueryResultItem, filter: SpatialFilter): boolean {
    // Simplified filter evaluation
    return true; // Would implement actual filter logic
  }
  
  private async sortQueryResults(results: SpatialQueryResultItem[], sortCriteria?: SpatialSortCriteria): Promise<SpatialQueryResultItem[]> {
    if (!sortCriteria) {
      return results;
    }
    
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortCriteria.sortBy) {
        case 'distance':
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case 'custom':
          if (sortCriteria.customComparator) {
            comparison = sortCriteria.customComparator(a.instanceId, b.instanceId);
          }
          break;
        default:
          comparison = 0;
      }
      
      return sortCriteria.ascending ? comparison : -comparison;
    });
  }
  
  private calculateQueryExplainability(query: SpatialQuery, results: SpatialQueryResultItem[]): ExplainabilityScore {
    // Simplified explainability calculation
    return 0.9 as ExplainabilityScore;
  }
  
  private calculateSpatialRelevance(query: SpatialQuery, results: SpatialQueryResultItem[]): number {
    // Simplified relevance calculation
    return results.length > 0 ? 0.8 : 0.0;
  }
  
  private async updateSpaceUsagePattern(spaceId: GlyphSpaceId, query: SpatialQuery): Promise<void> {
    // Update usage pattern based on query
    const space = this.spaceRegistry.get(spaceId);
    if (!space) return;
    
    const updatedPattern = {
      ...space.metadata.usagePattern,
      queryTypes: [...new Set([...space.metadata.usagePattern.queryTypes, query.queryType])]
    };
    
    const updatedSpace: GlyphSpaceStructure = {
      ...space,
      metadata: {
        ...space.metadata,
        usagePattern: updatedPattern
      }
    };
    
    this.spaceRegistry.set(spaceId, updatedSpace);
  }
  
  private validateTransformation(transformation: CoordinateTransformation, coordinate: NDimensionalCoordinate): void {
    if (transformation.sourceDimensions !== coordinate.dimensions) {
      throw new Error(`Transformation source dimensions ${transformation.sourceDimensions} do not match coordinate dimensions ${coordinate.dimensions}`);
    }
  }
  
  private async applyCoordinateTransformation(coordinate: NDimensionalCoordinate, transformation: CoordinateTransformation): Promise<ReadonlyArray<number>> {
    // Simplified transformation application
    if (transformation.type === 'linear' && transformation.matrix) {
      return this.multiplyMatrixVector(transformation.matrix, coordinate.coordinates);
    }
    
    // For non-linear transformations, would implement specific transform functions
    return coordinate.coordinates.slice(0, transformation.targetDimensions);
  }
  
  private multiplyMatrixVector(matrix: ReadonlyArray<ReadonlyArray<number>>, vector: ReadonlyArray<number>): ReadonlyArray<number> {
    const result: number[] = [];
    
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(sum);
    }
    
    return result;
  }
  
  private createProjectionTransformation(sourceDimensions: number, targetDimensions: number, projectionType: string): CoordinateTransformation {
    // Create projection matrix (simplified)
    const matrix: number[][] = [];
    for (let i = 0; i < targetDimensions; i++) {
      const row: number[] = [];
      for (let j = 0; j < sourceDimensions; j++) {
        row.push(i === j ? 1 : 0);
      }
      matrix.push(row);
    }
    
    return {
      id: this.generateTransformationId(),
      type: 'projection',
      sourceDimensions: sourceDimensions,
      targetDimensions: targetDimensions,
      matrix: matrix,
      parameters: { projectionType: projectionType },
      preservedProperties: ['distance_ratios']
    };
  }
  
  private createEmbeddingTransformation(sourceDimensions: number, targetDimensions: number, embeddingType: string): CoordinateTransformation {
    // Create embedding matrix (simplified)
    const matrix: number[][] = [];
    for (let i = 0; i < targetDimensions; i++) {
      const row: number[] = [];
      for (let j = 0; j < sourceDimensions; j++) {
        row.push(i === j ? 1 : 0);
      }
      matrix.push(row);
    }
    
    return {
      id: this.generateTransformationId(),
      type: 'embedding',
      sourceDimensions: sourceDimensions,
      targetDimensions: targetDimensions,
      matrix: matrix,
      parameters: { embeddingType: embeddingType },
      preservedProperties: ['distances', 'angles']
    };
  }
  
  private calculateDistance(pos1: NDimensionalCoordinate, pos2: NDimensionalCoordinate): number {
    if (pos1.dimensions !== pos2.dimensions) {
      throw new Error('Cannot calculate distance between coordinates of different dimensions');
    }
    
    let sumOfSquares = 0;
    for (let i = 0; i < pos1.dimensions; i++) {
      const diff = pos1.coordinates[i] - pos2.coordinates[i];
      sumOfSquares += diff * diff;
    }
    
    return Math.sqrt(sumOfSquares);
  }
  
  private calculateDirection(from: NDimensionalCoordinate, to: NDimensionalCoordinate): NDimensionalCoordinate {
    if (from.dimensions !== to.dimensions) {
      throw new Error('Cannot calculate direction between coordinates of different dimensions');
    }
    
    const direction: number[] = [];
    let magnitude = 0;
    
    // Calculate direction vector
    for (let i = 0; i < from.dimensions; i++) {
      const diff = to.coordinates[i] - from.coordinates[i];
      direction.push(diff);
      magnitude += diff * diff;
    }
    
    magnitude = Math.sqrt(magnitude);
    
    // Normalize to unit vector
    if (magnitude > 0) {
      for (let i = 0; i < direction.length; i++) {
        direction[i] /= magnitude;
      }
    }
    
    return {
      dimensions: from.dimensions,
      coordinates: direction,
      coordinateSystem: from.coordinateSystem,
      __ndCoordinate: Symbol('ndCoordinate')
    };
  }
  
  private calculateRelationshipStrength(distance: number, relationshipType: SpatialRelationshipType): number {
    // Simplified strength calculation based on distance and type
    const maxDistance = this.config.relationshipThreshold;
    const strength = Math.max(0, 1 - (distance / maxDistance));
    
    // Adjust based on relationship type
    switch (relationshipType) {
      case 'neighbor':
        return strength;
      case 'quantum_entangled':
        return 1.0; // Quantum relationships are distance-independent
      default:
        return strength;
    }
  }
  
  private estimateRelationshipCost(relationshipType: SpatialRelationshipType): number {
    // Simplified cost estimation
    switch (relationshipType) {
      case 'neighbor':
        return 1;
      case 'quantum_entangled':
        return 10;
      case 'clustered':
        return 5;
      default:
        return 3;
    }
  }
  
  private updateGlobalPerformanceMetrics(): void {
    this.performanceMetrics.totalSpaces = this.spaceRegistry.size;
    this.performanceMetrics.totalInstances = this.instancePositions.size;
    this.performanceMetrics.totalRelationships = this.spatialRelationships.size;
    
    // Calculate average metrics across all spaces
    let totalQueryTime = 0;
    let totalIndexEfficiency = 0;
    let totalMemoryUsage = 0;
    let totalOptimizationScore = 0;
    let spaceCount = 0;
    
    for (const space of this.spaceRegistry.values()) {
      totalQueryTime += space.performance.averageQueryTime;
      totalIndexEfficiency += space.performance.indexEfficiency;
      totalMemoryUsage += space.performance.memoryUsage;
      totalOptimizationScore += space.performance.optimizationScore;
      spaceCount++;
    }
    
    if (spaceCount > 0) {
      this.performanceMetrics.averageQueryTime = totalQueryTime / spaceCount;
      this.performanceMetrics.indexEfficiency = totalIndexEfficiency / spaceCount;
      this.performanceMetrics.memoryUsage = totalMemoryUsage;
      this.performanceMetrics.optimizationScore = totalOptimizationScore / spaceCount;
    }
  }
  
  // ID generation utilities
  private generateSpaceId(): GlyphSpaceId {
    return `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as GlyphSpaceId;
  }
  
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateRelationshipId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateTransformationId(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================
  
  /**
   * Get manager status and metrics
   */
  public getManagerStatus(): typeof this.performanceMetrics & { isInitialized: boolean } {
    return {
      isInitialized: this.isInitialized,
      ...this.performanceMetrics
    };
  }
  
  /**
   * Get all glyph spaces
   */
  public getAllGlyphSpaces(): ReadonlyArray<GlyphSpaceStructure> {
    return Array.from(this.spaceRegistry.values());
  }
  
  /**
   * Optimize all spatial indices
   */
  public async optimizeAllIndices(): Promise<void> {
    for (const [spaceId, space] of this.spaceRegistry) {
      await this.rebuildSpatialIndex(spaceId, space);
    }
    
    this.emit('optimization_completed', { timestamp: Date.now() });
  }
}

// =============================================================================
// SPATIAL INDEX IMPLEMENTATION (SIMPLIFIED)
// =============================================================================

class SpatialIndex {
  private indexType: SpatialIndexType;
  private parameters: IndexingParameters;
  private dimensions: number = 0;
  private bounds?: CoordinateBounds;
  private instances: Map<GlyphInstanceId, NDimensionalCoordinate> = new Map();
  
  constructor(indexType: SpatialIndexType, parameters: IndexingParameters) {
    this.indexType = indexType;
    this.parameters = parameters;
  }
  
  async initialize(dimensions: number, bounds?: CoordinateBounds): Promise<void> {
    this.dimensions = dimensions;
    this.bounds = bounds;
    // Initialize specific index structure based on type
  }
  
  async insert(instanceId: GlyphInstanceId, position: NDimensionalCoordinate): Promise<void> {
    this.instances.set(instanceId, position);
    // Insert into specific index structure
  }
  
  async remove(instanceId: GlyphInstanceId): Promise<void> {
    this.instances.delete(instanceId);
    // Remove from specific index structure
  }
  
  async move(instanceId: GlyphInstanceId, oldPosition: NDimensionalCoordinate, newPosition: NDimensionalCoordinate): Promise<void> {
    this.instances.set(instanceId, newPosition);
    // Update in specific index structure
  }
  
  contains(instanceId: GlyphInstanceId): boolean {
    return this.instances.has(instanceId);
  }
  
  // Additional spatial index methods would be implemented here
}

// Singleton instance
export const glyphSpaceManager = GlyphSpaceManager.getInstance();