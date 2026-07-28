export type ProjectCategory =
  | 'Website'
  | 'Mobile App'
  | 'E-Commerce'
  | 'POS'
  | 'ERP'
  | 'LMS'
  | 'CRM'
  | 'Portfolio'
  | 'Landing Page'
  | 'Company Profile'
  | 'IoT'
  | 'AI SaaS'
  | 'Fintech'
  | 'Healthcare'
  | 'Education'
  | 'Game';

export type PlatformType = 'Web' | 'Mobile (iOS/Android)' | 'Desktop' | 'Cross-Platform' | 'API/Backend Service';

export type PRDStatus = 'draft' | 'review' | 'approved' | 'deprecated';

export type ComplexityLevel = 'Simple (1-2 Sprints)' | 'Medium (3-6 Sprints)' | 'Complex (Enterprise / Scaled)';

export interface TechStackConfig {
  frontend: string;
  backend: string;
  database: string;
  authentication: string;
  hosting: string;
  apiIntegrations: string;
}

export interface PRDInput {
  projectName: string;
  category: ProjectCategory;
  platform: PlatformType;
  targetUser: string;
  problemStatement: string;
  solution: string;
  mainFeatures: string;
  businessGoals: string;
  deadline: string;
  techStack: TechStackConfig;
  additionalPrompt?: string;
  complexity: ComplexityLevel;
  folderId?: string;
}

export interface UserStoryItem {
  id: string;
  feature: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  description: string;
  userStory: string;
  acceptanceCriteria: string[];
}

export interface NonFunctionalReq {
  category: string;
  requirement: string;
  target: string;
}

export interface UserPersona {
  name: string;
  role: string;
  painPoints: string[];
  goals: string[];
}

export interface Stakeholder {
  role: string;
  responsibility: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface JourneyStep {
  step: number;
  userAction: string;
  systemResponse: string;
  keyTouchpoint: string;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowDiagram {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface IAPage {
  title: string;
  path: string;
  components: string[];
}

export interface FeatureItem {
  name: string;
  category: "MoSCoW - Must" | "MoSCoW - Should" | "MoSCoW - Could" | "MoSCoW - Won't";
  effort: 'Small' | 'Medium' | 'Large' | 'XL';
  description: string;
}

export interface APIEndpointSpec {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  reqPayload?: string;
  resPayload?: string;
}

export interface DBColumn {
  name: string;
  type: string;
  constraints: string;
}

export interface DBTable {
  name: string;
  description: string;
  columns: DBColumn[];
}

export interface RolePermission {
  role: string;
  permissions: string[];
}

export interface NotificationRule {
  event: string;
  channel: string;
  recipient: string;
  template: string;
}

export interface ComponentSpec {
  name: string;
  purpose: string;
  props: string;
}

export interface ResponsiveRule {
  device: string;
  breakpoint: string;
  behavior: string;
}

export interface AnalyticsEvent {
  eventName: string;
  trigger: string;
  parameters: string;
}

export interface TestingRule {
  testType: string;
  scope: string;
  tools: string;
}

export interface RiskItem {
  risk: string;
  impact: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface RoadmapPhase {
  phase: string;
  timeframe: string;
  deliverables: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  estimatedHours: number;
  dependency?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface SprintPlan {
  sprint: string;
  focus: string;
  storyPoints: number;
  tasks: string[];
}

export interface ReleaseChecklistItem {
  item: string;
  status: 'pending' | 'completed';
  category: string;
}

export interface PRDDocument {
  id: string;
  title: string;
  workspaceId: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  lastEdited?: string;
  isFavorite: boolean;
  isArchived: boolean;
  inTrash: boolean;
  status: PRDStatus;
  version: string;
  tags: string[];
  category: ProjectCategory;
  platform: PlatformType;
  complexity: ComplexityLevel;
  author: string;
  inputs: PRDInput;

  // Sections
  executiveSummary: string;
  problemStatement: string;
  goals: {
    businessGoals: string[];
    nonGoals: string[];
  };
  successMetrics: {
    metric: string;
    target: string;
    timeframe: string;
  }[];
  businessRequirements: string[];
  functionalRequirements: UserStoryItem[];
  nonFunctionalRequirements: NonFunctionalReq[];
  userPersonas: UserPersona[];
  stakeholders: Stakeholder[];
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  userJourney: JourneyStep[];
  flowDiagram: FlowDiagram;
  informationArchitecture: {
    pages: IAPage[];
  };
  featureList: FeatureItem[];
  acceptanceCriteriaSummary: string[];
  securityRequirements: string[];
  accessibilityStandards: string[];
  performanceTargets: {
    metric: string;
    target: string;
  }[];
  apiSpecification: APIEndpointSpec[];
  databaseDesign: {
    tables: DBTable[];
  };
  entityRelationshipSummary: string;
  rolePermissions: RolePermission[];
  notificationFlow: NotificationRule[];
  uiRequirements: string[];
  designSystem: {
    colors: {
      primary: string;
      darkRed: string;
      background: string;
      surface: string;
    };
    typography: string;
    spacing: string;
    borderRadius: string;
  };
  componentList: ComponentSpec[];
  responsiveRequirements: ResponsiveRule[];
  seoRequirements: string[];
  analyticsStrategy: AnalyticsEvent[];
  testingStrategy: TestingRule[];
  deploymentStrategy:
    | {
        stage: string;
        environment: string;
        ciCdPipeline: string;
      }
    | {
        stage: string;
        environment: string;
        ciCdPipeline: string;
      }[];
  riskAssessment: RiskItem[];
  futureRoadmap: RoadmapPhase[];
  taskBreakdown: TaskItem[];
  sprintPlanning: SprintPlan[];
  releaseChecklist: ReleaseChecklistItem[];
  comments?: CommentItem[];
  aiCodingPrompt: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface PRDComment {
  id: string;
  prdId: string;
  sectionId: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

export interface PRDVersionSnapshot {
  id: string;
  prdId: string;
  versionNumber: string;
  savedAt: string;
  summary: string;
  data: PRDDocument;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
}

export interface Folder {
  id: string;
  workspaceId?: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface TemplatePreset {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  iconName: string;
  badge: string;
  inputs: Partial<PRDInput>;
}
