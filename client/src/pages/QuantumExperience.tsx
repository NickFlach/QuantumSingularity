import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronRight,
  Share2,
  Users,
  Sparkles,
  Zap,
  MessageCircle,
  Award,
  Heart,
  BookOpen,
  Download,
  Upload,
  Atom,
  Wand2,
  Lightbulb,
  Layers,
  TerminalSquare,
  Send,
  PlusCircle,
  Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// A representation of a quantum operation
interface QuantumOperation {
  id: string;
  type: string;
  name: string;
  description: string;
  visualElement: JSX.Element; // Visual representation
  soundEffect?: string; // Optional sound effect URL
  animation?: string; // Animation style
  energyRequired: number; // How much "quantum energy" needed
}

// A quantum experiment combining multiple operations
interface QuantumExperiment {
  id: string;
  name: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  operations: QuantumOperation[];
  likes: number;
  shares: number;
  comments: number;
  collaborators: {
    id: string;
    name: string;
    avatar: string;
  }[];
  createdAt: string;
  tags: string[];
  visualizationUrl?: string;
  results?: {
    description: string;
    probability: number;
    energyOutput: number;
    visual: JSX.Element;
  }[];
}

// A community share or insight about a quantum concept
interface QuantumInsight {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  attachment?: {
    type: "image" | "circuit" | "experiment";
    url: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
}

// Achievement unlocked by performing certain operations
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  progress?: {
    current: number;
    total: number;
  };
}

// Define available quantum operations with visual elements
const QUANTUM_OPERATIONS: QuantumOperation[] = [
  {
    id: "hadamard",
    type: "gate",
    name: "Hadamard Enchantment",
    description: "Creates a magical superposition of states, revealing multiple realities simultaneously",
    energyRequired: 10,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
        <Sparkles className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "xgate",
    type: "gate",
    name: "Reality Flip",
    description: "Inverts the current reality, turning 0 to 1 and vice versa",
    energyRequired: 8,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30">
        <Zap className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "entangle",
    type: "interaction",
    name: "Quantum Entanglement Bond",
    description: "Creates a mystical bond between particles, linking their fates across any distance",
    energyRequired: 25,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30">
        <Heart className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "teleport",
    type: "protocol",
    name: "Quantum Teleportation",
    description: "Magically transfers the essence of one particle to another instantaneously",
    energyRequired: 40,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
        <Send className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "oracle",
    type: "algorithm",
    name: "Oracle Invocation",
    description: "Summons a mysterious quantum oracle that reveals hidden patterns",
    energyRequired: 35,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30">
        <Lightbulb className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "superposition",
    type: "state",
    name: "Cosmic Superposition",
    description: "Creates a magnificent blend of all possible quantum states at once",
    energyRequired: 15,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
        <Layers className="w-6 h-6" />
      </div>
    ),
  },
  {
    id: "measurement",
    type: "observation",
    name: "Reality Collapse",
    description: "Observes the quantum realm, collapsing possibilities into a single reality",
    energyRequired: 5,
    visualElement: (
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-lg shadow-gray-500/30">
        <TerminalSquare className="w-6 h-6" />
      </div>
    ),
  },
];

// Sample community experiments to show
const SAMPLE_EXPERIMENTS: QuantumExperiment[] = [
  {
    id: "exp1",
    name: "Butterfly Effect Simulator",
    description: "Experience how tiny quantum fluctuations cascade into massive changes",
    creator: {
      id: "user1",
      name: "QuantumDreamer",
      avatar: "/avatars/user1.png",
    },
    operations: [
      QUANTUM_OPERATIONS.find(op => op.id === "hadamard")!,
      QUANTUM_OPERATIONS.find(op => op.id === "entangle")!,
      QUANTUM_OPERATIONS.find(op => op.id === "measurement")!,
    ],
    likes: 342,
    shares: 87,
    comments: 41,
    collaborators: [
      { id: "user2", name: "WaveFunction", avatar: "/avatars/user2.png" },
      { id: "user3", name: "QuantumWizard", avatar: "/avatars/user3.png" },
    ],
    createdAt: "2025-03-12T14:56:00Z",
    tags: ["beginner-friendly", "visualization", "butterfly-effect"],
    results: [
      {
        description: "Harmonious Universe",
        probability: 0.46,
        energyOutput: 120,
        visual: <div className="w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg" />
      },
      {
        description: "Chaotic System",
        probability: 0.54,
        energyOutput: 180,
        visual: <div className="w-full h-32 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg" />
      }
    ]
  },
  {
    id: "exp2",
    name: "Quantum Consciousness Explorer",
    description: "A fascinating journey into quantum aspects of consciousness",
    creator: {
      id: "user4",
      name: "MindQuantum",
      avatar: "/avatars/user4.png",
    },
    operations: [
      QUANTUM_OPERATIONS.find(op => op.id === "superposition")!,
      QUANTUM_OPERATIONS.find(op => op.id === "oracle")!,
      QUANTUM_OPERATIONS.find(op => op.id === "teleport")!,
    ],
    likes: 529,
    shares: 203,
    comments: 89,
    collaborators: [
      { id: "user5", name: "BrainWaveCollapse", avatar: "/avatars/user5.png" },
      { id: "user6", name: "NeuralEntanglement", avatar: "/avatars/user6.png" },
      { id: "user7", name: "ConsciousComputing", avatar: "/avatars/user7.png" },
    ],
    createdAt: "2025-02-28T09:34:00Z",
    tags: ["advanced", "consciousness", "philosophy", "mind"],
    results: [
      {
        description: "Unified Field of Consciousness",
        probability: 0.33,
        energyOutput: 350,
        visual: <div className="w-full h-32 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 rounded-lg" />
      },
      {
        description: "Fragmented Awareness",
        probability: 0.67,
        energyOutput: 290,
        visual: <div className="w-full h-32 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-lg" />
      }
    ]
  },
];

// Sample community insights
const SAMPLE_INSIGHTS: QuantumInsight[] = [
  {
    id: "insight1",
    author: {
      id: "user8",
      name: "QuantumPoet",
      avatar: "/avatars/user8.png",
    },
    content: "I've discovered that running the Hadamard enchantment three times in sequence creates the most beautiful interference patterns! It's like watching the universe breathe. Has anyone else experienced this?",
    likes: 87,
    comments: 12,
    createdAt: "2025-03-23T18:45:00Z",
  },
  {
    id: "insight2",
    author: {
      id: "user9",
      name: "CosmicEntangler",
      avatar: "/avatars/user9.png",
    },
    content: "Just had a profound realization - quantum entanglement isn't just about particles. It's a metaphor for human connections. The more I study quantum physics, the more I understand relationships between people.",
    attachment: {
      type: "image",
      url: "/insights/entanglement-visualization.jpg",
    },
    likes: 145,
    comments: 34,
    createdAt: "2025-03-21T11:23:00Z",
  },
  {
    id: "insight3",
    author: {
      id: "user10",
      name: "WaveFunctionArtist",
      avatar: "/avatars/user10.png",
    },
    content: "Created this quantum artwork by translating superposition states into color patterns. Each color represents a different probability amplitude. What do you see in this?",
    attachment: {
      type: "image",
      url: "/insights/quantum-art.jpg",
    },
    likes: 219,
    comments: 52,
    createdAt: "2025-03-19T15:12:00Z",
  },
];

// Sample achievements
const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach1",
    name: "Quantum Novice",
    description: "Created your first quantum experiment",
    icon: <Award className="h-6 w-6 text-amber-500" />,
    unlockedAt: "2025-03-14T10:24:00Z",
    rarity: "common",
  },
  {
    id: "ach2",
    name: "Entanglement Expert",
    description: "Successfully entangled 10 particle pairs",
    icon: <Award className="h-6 w-6 text-violet-500" />,
    rarity: "uncommon",
    progress: {
      current: 7,
      total: 10,
    },
  },
  {
    id: "ach3",
    name: "Social Quantum Pioneer",
    description: "Shared experiments with 50 other users",
    icon: <Award className="h-6 w-6 text-blue-500" />,
    rarity: "rare",
    progress: {
      current: 23,
      total: 50,
    },
  },
  {
    id: "ach4",
    name: "Quantum Visionary",
    description: "Created an experiment that's been liked by 100 people",
    icon: <Award className="h-6 w-6 text-rose-500" />,
    rarity: "legendary",
    progress: {
      current: 42,
      total: 100,
    },
  },
];

export default function QuantumExperience() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  const [userEnergy, setUserEnergy] = useState(100);
  const [selectedOperations, setSelectedOperations] = useState<QuantumOperation[]>([]);
  const [experimentName, setExperimentName] = useState("My Cosmic Experiment");
  const [experimentDescription, setExperimentDescription] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<null | any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [communityExperiments, setCommunityExperiments] = useState(SAMPLE_EXPERIMENTS);
  const [communityInsights, setCommunityInsights] = useState(SAMPLE_INSIGHTS);
  const [achievements, setAchievements] = useState(SAMPLE_ACHIEVEMENTS);
  const [showUnlockedAchievement, setShowUnlockedAchievement] = useState<Achievement | null>(null);
  const [experimentTags, setExperimentTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }[] = [];
    
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    
    // Create particles
    function createParticles(count: number) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1 - 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Draw lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    
    // Handle resize
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 10000)));
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Handle adding operation to experiment
  const addOperation = (operation: QuantumOperation) => {
    // Check if we have enough energy
    if (userEnergy < operation.energyRequired) {
      toast({
        title: "Not Enough Quantum Energy",
        description: `You need ${operation.energyRequired} energy but only have ${userEnergy}.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the operation
    setSelectedOperations([...selectedOperations, operation]);
    
    // Reduce user's energy
    setUserEnergy(userEnergy - operation.energyRequired);
    
    // Show feedback
    toast({
      title: "Operation Added",
      description: `Added ${operation.name} to your experiment.`,
      variant: "default",
    });
    
    // Check if we should award an achievement
    if (selectedOperations.length === 0) {
      const achievement = achievements.find(a => a.id === "ach1" && !a.unlockedAt);
      if (achievement) {
        const updatedAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString(),
        };
        setAchievements(achievements.map(a => a.id === "ach1" ? updatedAchievement : a));
        setShowUnlockedAchievement(updatedAchievement);
      }
    }
  };
  
  // Remove operation from experiment
  const removeOperation = (index: number) => {
    const operation = selectedOperations[index];
    const newOperations = [...selectedOperations];
    newOperations.splice(index, 1);
    setSelectedOperations(newOperations);
    
    // Refund some energy (but not all - there's a cost to experimentation!)
    const refundAmount = Math.floor(operation.energyRequired * 0.7);
    setUserEnergy(userEnergy + refundAmount);
    
    toast({
      title: "Operation Removed",
      description: `Removed ${operation.name} and recovered ${refundAmount} energy.`,
    });
  };
  
  // Simulate the experiment
  const runExperiment = async () => {
    if (selectedOperations.length === 0) {
      toast({
        title: "Cannot Run Experiment",
        description: "Add at least one quantum operation first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSimulating(true);
    
    // This would typically be an API call, but we'll simulate it
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a simulated result
      const result = {
        success: true,
        outcomes: [
          {
            state: "State Alpha",
            probability: 0.37,
            description: "A harmonious quantum state with balanced energy",
            visual: <div className="w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg" />
          },
          {
            state: "State Omega",
            probability: 0.63,
            description: "A vibrant but unstable quantum configuration",
            visual: <div className="w-full h-32 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-lg" />
          }
        ],
        energyOutput: Math.floor(Math.random() * 100) + 50,
        insights: [
          "The Reality Flip operation created fascinating interference patterns",
          "Quantum Entanglement Bond showed strong coherence throughout the experiment",
          "Consider adding an Oracle Invocation to reduce noise in future experiments"
        ]
      };
      
      setSimulationResult(result);
      
      // Grant some energy back as a reward
      const energyReward = Math.floor(result.energyOutput * 0.5);
      setUserEnergy(userEnergy + energyReward);
      
      toast({
        title: "Experiment Completed!",
        description: `Gained ${energyReward} quantum energy from your successful experiment.`,
      });
      
      // Update achievement progress
      const entanglementAchievement = achievements.find(a => a.id === "ach2");
      if (entanglementAchievement && selectedOperations.some(op => op.id === "entangle")) {
        const updatedAchievement = {
          ...entanglementAchievement,
          progress: {
            current: Math.min(entanglementAchievement.progress!.current + 1, entanglementAchievement.progress!.total),
            total: entanglementAchievement.progress!.total
          }
        };
        
        // Check if we've completed the achievement
        if (updatedAchievement.progress!.current >= updatedAchievement.progress!.total) {
          updatedAchievement.unlockedAt = new Date().toISOString();
          setShowUnlockedAchievement(updatedAchievement);
        }
        
        setAchievements(achievements.map(a => a.id === "ach2" ? updatedAchievement : a));
      }
    } catch (error) {
      console.error("Experiment error:", error);
      toast({
        title: "Experiment Failed",
        description: "Something went wrong during the quantum simulation.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  // Share experiment with the community
  const shareExperiment = () => {
    if (!experimentName) {
      toast({
        title: "Name Required",
        description: "Please give your experiment a name before sharing.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new experiment object
    const newExperiment: QuantumExperiment = {
      id: `exp-${Date.now()}`,
      name: experimentName,
      description: experimentDescription || "A fascinating quantum experiment",
      creator: {
        id: user?.id.toString() || "user-anon",
        name: user?.username || "Anonymous Scientist",
        avatar: "/avatars/default.png",
      },
      operations: [...selectedOperations],
      likes: 0,
      shares: 0,
      comments: 0,
      collaborators: [],
      createdAt: new Date().toISOString(),
      tags: [...experimentTags],
      results: simulationResult ? [
        {
          description: simulationResult.outcomes[0].state,
          probability: simulationResult.outcomes[0].probability,
          energyOutput: simulationResult.energyOutput,
          visual: simulationResult.outcomes[0].visual
        },
        {
          description: simulationResult.outcomes[1].state,
          probability: simulationResult.outcomes[1].probability,
          energyOutput: simulationResult.energyOutput,
          visual: simulationResult.outcomes[1].visual
        }
      ] : undefined
    };
    
    // Add to community experiments
    setCommunityExperiments([newExperiment, ...communityExperiments]);
    
    // Share insight if user added a message
    if (userMessage) {
      const newInsight: QuantumInsight = {
        id: `insight-${Date.now()}`,
        author: {
          id: user?.id.toString() || "user-anon",
          name: user?.username || "Anonymous Scientist",
          avatar: "/avatars/default.png",
        },
        content: userMessage,
        attachment: {
          type: "experiment",
          url: `/experiments/${newExperiment.id}`
        },
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      
      setCommunityInsights([newInsight, ...communityInsights]);
      setUserMessage("");
    }
    
    // Update sharing achievement
    const sharingAchievement = achievements.find(a => a.id === "ach3");
    if (sharingAchievement) {
      const updatedAchievement = {
        ...sharingAchievement,
        progress: {
          current: Math.min(sharingAchievement.progress!.current + 1, sharingAchievement.progress!.total),
          total: sharingAchievement.progress!.total
        }
      };
      
      // Check if we've completed the achievement
      if (updatedAchievement.progress!.current >= updatedAchievement.progress!.total) {
        updatedAchievement.unlockedAt = new Date().toISOString();
        setShowUnlockedAchievement(updatedAchievement);
      }
      
      setAchievements(achievements.map(a => a.id === "ach3" ? updatedAchievement : a));
    }
    
    setIsSharing(false);
    
    toast({
      title: "Experiment Shared!",
      description: "Your quantum experiment is now visible to the community.",
    });
    
    // Reset experiment after sharing
    setSelectedOperations([]);
    setExperimentName("My Cosmic Experiment");
    setExperimentDescription("");
    setSimulationResult(null);
    setExperimentTags([]);
  };
  
  // Like an experiment
  const likeExperiment = (experimentId: string) => {
    setCommunityExperiments(communityExperiments.map(exp => {
      if (exp.id === experimentId) {
        return { ...exp, likes: exp.likes + 1 };
      }
      return exp;
    }));
    
    toast({
      title: "Liked Experiment",
      description: "Your appreciation has been shared with the creator.",
    });
  };
  
  // Add a new tag to the experiment
  const addTag = () => {
    if (!newTag.trim()) return;
    if (experimentTags.includes(newTag.trim())) {
      toast({
        title: "Tag Already Added",
        description: "This tag is already added to your experiment.",
        variant: "destructive",
      });
      return;
    }
    
    setExperimentTags([...experimentTags, newTag.trim()]);
    setNewTag("");
  };
  
  // Remove a tag from the experiment
  const removeTag = (tag: string) => {
    setExperimentTags(experimentTags.filter(t => t !== tag));
  };
  
  // Format a timestamp
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Particle animation background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-30"
      />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Quantum Experience
              </h1>
              <p className="text-slate-300 mt-2">
                Create, share and explore quantum wonders with the community
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 rounded-full px-4 py-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-mono text-amber-400">{userEnergy}</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Award className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Quantum Achievements</DialogTitle>
                    <DialogDescription>
                      Your progress in mastering quantum operations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          achievement.unlockedAt ? 'bg-slate-700' : 'bg-slate-800'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            {achievement.unlockedAt && (
                              <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full">
                                Unlocked
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                              achievement.rarity === 'common' ? 'bg-slate-600 text-slate-100' :
                              achievement.rarity === 'uncommon' ? 'bg-blue-700 text-blue-100' :
                              achievement.rarity === 'rare' ? 'bg-purple-700 text-purple-100' :
                              'bg-amber-700 text-amber-100'
                            }`}>
                              {achievement.rarity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{achievement.description}</p>
                          {achievement.progress && (
                            <div className="mt-2">
                              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{width: `${(achievement.progress.current / achievement.progress.total) * 100}%`}}
                                />
                              </div>
                              <p className="text-xs text-right mt-1 text-slate-400">
                                {achievement.progress.current} / {achievement.progress.total}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              {user && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          {/* Main tabs */}
          <Tabs 
            defaultValue="create" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="create" className="data-[state=active]:bg-indigo-900/50">
                <Wand2 className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="explore" className="data-[state=active]:bg-purple-900/50">
                <Globe className="h-4 w-4 mr-2" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="community" className="data-[state=active]:bg-rose-900/50">
                <Users className="h-4 w-4 mr-2" />
                Community
              </TabsTrigger>
            </TabsList>
            
            {/* Create Tab Content */}
            <TabsContent value="create" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Operations palette */}
                <Card className="bg-slate-900/70 border-slate-800">
                  <CardHeader>
                    <CardTitle>Quantum Operations</CardTitle>
                    <CardDescription>
                      Drag or click to add operations to your experiment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {QUANTUM_OPERATIONS.map(operation => (
                      <motion.div
                        key={operation.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                          ${userEnergy < operation.energyRequired ? 'opacity-50' : 'hover:bg-slate-800'}
                          border border-slate-700`}
                        onClick={() => addOperation(operation)}
                      >
                        {operation.visualElement}
                        <div className="flex-1">
                          <h3 className="font-medium">{operation.name}</h3>
                          <p className="text-xs text-slate-400">{operation.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-mono text-sm">
                          <Zap className="h-3 w-3" />
                          {operation.energyRequired}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Center column - Current experiment */}
                <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1.5">
                        <Label htmlFor="experiment-name">Experiment Name</Label>
                        <Input
                          id="experiment-name"
                          value={experimentName}
                          onChange={(e) => setExperimentName(e.target.value)}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOperations([])}
                          disabled={selectedOperations.length === 0}
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={runExperiment}
                          disabled={isSimulating || selectedOperations.length === 0}
                          className="bg-indigo-700 hover:bg-indigo-600"
                        >
                          {isSimulating ? (
                            <>Simulating...</>
                          ) : (
                            <>Run Experiment</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {experimentTags.map(tag => (
                        <div 
                          key={tag} 
                          className="bg-slate-800 text-slate-300 text-xs rounded-full px-3 py-1 flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => removeTag(tag)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag..."
                          className="bg-slate-800 border-slate-700 w-24 h-6 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={addTag}
                        >
                          <PlusCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Label htmlFor="experiment-description">Description</Label>
                    <Input
                      id="experiment-description"
                      value={experimentDescription}
                      onChange={(e) => setExperimentDescription(e.target.value)}
                      placeholder="Describe what your experiment does..."
                      className="bg-slate-800 border-slate-700"
                    />
                    
                    {/* Visualization area */}
                    <div className="relative min-h-[200px] rounded-lg bg-slate-950 border border-slate-800 p-4 overflow-hidden">
                      {selectedOperations.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                          <Atom className="h-12 w-12 mb-2 opacity-20" />
                          <p>Add quantum operations to start your experiment</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedOperations.map((operation, index) => (
                            <motion.div
                              key={`${operation.id}-${index}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                            >
                              {operation.visualElement}
                              <div className="flex-1">
                                <h3 className="font-medium">{operation.name}</h3>
                                <p className="text-xs text-slate-400">Step {index + 1}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-300"
                                onClick={() => removeOperation(index)}
                              >
                                &times;
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Experiment results */}
                    {simulationResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 space-y-4"
                      >
                        <div className="pt-4 border-t border-slate-800">
                          <h3 className="text-lg font-semibold mb-2">Experiment Results</h3>
                          
                          <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            {simulationResult.outcomes.map((outcome: any, i: number) => (
                              <Card key={i} className="bg-slate-800/50 border-slate-700">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">
                                    {outcome.state}
                                    <span className="ml-2 text-sm font-normal">
                                      ({(outcome.probability * 100).toFixed(1)}%)
                                    </span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <p className="text-sm text-slate-300">{outcome.description}</p>
                                  {outcome.visual}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="bg-slate-800/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Quantum Insights:</h4>
                            <ul className="space-y-1 text-sm">
                              {simulationResult.insights.map((insight: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <div className="pt-1">•</div>
                                  <div>{insight}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex justify-center mt-6">
                            <Dialog open={isSharing} onOpenChange={setIsSharing}>
                              <DialogTrigger asChild>
                                <Button className="bg-purple-700 hover:bg-purple-600">
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share with Community
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle>Share Your Quantum Discovery</DialogTitle>
                                  <DialogDescription>
                                    Your experiment will be visible to the quantum community
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="share-message">Add a message (optional)</Label>
                                    <textarea
                                      id="share-message"
                                      className="w-full min-h-[100px] rounded-md bg-slate-800 border-slate-700 p-3"
                                      placeholder="Share your thoughts about this experiment..."
                                      value={userMessage}
                                      onChange={(e) => setUserMessage(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="rounded-md bg-slate-800/50 p-3">
                                    <h4 className="text-sm font-medium mb-2">Experiment Preview</h4>
                                    <div className="text-xs text-slate-400">
                                      <p><strong>Name:</strong> {experimentName}</p>
                                      <p><strong>Operations:</strong> {selectedOperations.map(op => op.name).join(", ")}</p>
                                      <p><strong>Results:</strong> {simulationResult.outcomes.length} possible outcomes</p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsSharing(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className="bg-purple-700 hover:bg-purple-600"
                                    onClick={shareExperiment}
                                  >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Explore Tab Content */}
            <TabsContent value="explore" className="space-y-6">
              <Card className="bg-slate-900/70 border-slate-800">
                <CardHeader>
                  <CardTitle>Community Experiments</CardTitle>
                  <CardDescription>
                    Explore quantum experiments created by the community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {communityExperiments.map(experiment => (
                    <Card key={experiment.id} className="overflow-hidden bg-slate-800/50 border-slate-700">
                      <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{experiment.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${experiment.creator.name}`} />
                                  <AvatarFallback className="text-[10px]">
                                    {experiment.creator.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {experiment.creator.name}
                              </div>
                              <span>•</span>
                              <span>{formatTime(experiment.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {experiment.tags.slice(0, 2).map(tag => (
                              <div key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                #{tag}
                              </div>
                            ))}
                            {experiment.tags.length > 2 && (
                              <div className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                +{experiment.tags.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <p className="text-slate-300">{experiment.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {experiment.operations.map(operation => (
                            <div 
                              key={operation.id} 
                              className="flex items-center gap-1 text-xs bg-slate-700 px-2 py-1 rounded-full"
                            >
                              {operation.visualElement}
                              <span>{operation.name}</span>
                            </div>
                          ))}
                        </div>
                        
                        {experiment.results && (
                          <div className="grid grid-cols-2 gap-3">
                            {experiment.results.map((result, i) => (
                              <div 
                                key={i}
                                className="rounded-lg overflow-hidden bg-slate-700/30 border border-slate-700"
                              >
                                <div className="aspect-video overflow-hidden">
                                  {result.visual}
                                </div>
                                <div className="p-2">
                                  <div className="flex justify-between text-xs">
                                    <span>{result.description}</span>
                                    <span className="font-mono">
                                      {(result.probability * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between border-t border-slate-700 bg-slate-800/30">
                        <div className="flex gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => likeExperiment(experiment.id)}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {experiment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {experiment.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                            <Share2 className="h-4 w-4 mr-1" />
                            {experiment.shares}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950"
                          >
                            <Wand2 className="h-4 w-4 mr-1" />
                            Clone
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Community Tab Content */}
            <TabsContent value="community" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Insights feed */}
                <div className="lg:col-span-2 space-y-4">
                  <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader>
                      <CardTitle>Quantum Insights</CardTitle>
                      <CardDescription>
                        Share your discoveries with the quantum community
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-800 rounded-lg p-4 mb-6">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${user?.username || 'anonymous'}`} />
                            <AvatarFallback>
                              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AN'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <textarea
                              className="w-full min-h-[80px] bg-slate-700 border-slate-600 rounded-md p-3 text-sm"
                              placeholder="Share an insight about quantum computing..."
                              value={userMessage}
                              onChange={(e) => setUserMessage(e.target.value)}
                            />
                            <div className="flex justify-between mt-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Upload className="h-3 w-3 mr-1" />
                                  Attach
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Atom className="h-3 w-3 mr-1" />
                                  Add Experiment
                                </Button>
                              </div>
                              <Button 
                                size="sm"
                                className="bg-indigo-700 hover:bg-indigo-600 text-xs"
                                disabled={!userMessage.trim()}
                                onClick={() => {
                                  if (!userMessage.trim()) return;
                                  
                                  const newInsight: QuantumInsight = {
                                    id: `insight-${Date.now()}`,
                                    author: {
                                      id: user?.id.toString() || "user-anon",
                                      name: user?.username || "Anonymous Scientist",
                                      avatar: "/avatars/default.png",
                                    },
                                    content: userMessage,
                                    likes: 0,
                                    comments: 0,
                                    createdAt: new Date().toISOString(),
                                  };
                                  
                                  setCommunityInsights([newInsight, ...communityInsights]);
                                  setUserMessage("");
                                  
                                  toast({
                                    title: "Insight Shared",
                                    description: "Your quantum insight has been shared with the community.",
                                  });
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {communityInsights.map(insight => (
                          <div 
                            key={insight.id}
                            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                          >
                            <div className="flex gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${insight.author.name}`} />
                                <AvatarFallback>
                                  {insight.author.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold">{insight.author.name}</h3>
                                  <span className="text-xs text-slate-400">
                                    {formatTime(insight.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-2 text-slate-300">{insight.content}</p>
                                
                                {insight.attachment && (
                                  <div className="mt-3 rounded-md overflow-hidden border border-slate-700">
                                    {insight.attachment.type === 'image' && (
                                      <div className="bg-slate-900 h-48 flex items-center justify-center">
                                        <div className="text-sm text-slate-400">Image Placeholder</div>
                                      </div>
                                    )}
                                    {insight.attachment.type === 'experiment' && (
                                      <div className="bg-slate-900 p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Atom className="h-5 w-5 text-indigo-400" />
                                          <div className="text-sm">Quantum Experiment</div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-xs h-7">
                                          View
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex gap-3 mt-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-slate-400 hover:text-slate-200 text-xs h-7"
                                    onClick={() => {
                                      setCommunityInsights(communityInsights.map(ins => {
                                        if (ins.id === insight.id) {
                                          return { ...ins, likes: ins.likes + 1 };
                                        }
                                        return ins;
                                      }));
                                    }}
                                  >
                                    <Heart className="h-3 w-3 mr-1" />
                                    {insight.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 text-xs h-7">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {insight.comments}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 text-xs h-7">
                                    <Share2 className="h-3 w-3 mr-1" />
                                    Share
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Sidebar with trending and recommended */}
                <div className="space-y-4">
                  <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Trending Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <div className="bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #quantum-consciousness
                        </div>
                        <div className="bg-purple-900/50 hover:bg-purple-900 text-purple-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #entanglement
                        </div>
                        <div className="bg-blue-900/50 hover:bg-blue-900 text-blue-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #teleportation
                        </div>
                        <div className="bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #superposition
                        </div>
                        <div className="bg-amber-900/50 hover:bg-amber-900 text-amber-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #quantum-art
                        </div>
                        <div className="bg-rose-900/50 hover:bg-rose-900 text-rose-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #beginner-friendly
                        </div>
                        <div className="bg-cyan-900/50 hover:bg-cyan-900 text-cyan-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                          #quantum-ai
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <h3 className="font-medium text-sm">Quantum Art Festival</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Explore artwork generated from quantum states
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-indigo-400">March 28, 2025</span>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Join
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <h3 className="font-medium text-sm">Quantum Hackathon</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Join teams to create innovative quantum applications
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-indigo-400">April 5-7, 2025</span>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Register
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Get Quantum Energy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-300">
                        Recharge your quantum energy to create more experiments
                      </p>
                      <div className="space-y-2">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                          <Zap className="h-4 w-4 mr-2" />
                          Daily Bonus (+25)
                        </Button>
                        <Button variant="outline" className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Complete Tutorials (+50)
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Share2 className="h-4 w-4 mr-2" />
                          Invite Friends (+15 each)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Achievement unlocked notification */}
      <AnimatePresence>
        {showUnlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="w-80 bg-slate-800 border-slate-700">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Achievement Unlocked!
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    showUnlockedAchievement.rarity === 'common' ? 'bg-slate-700' :
                    showUnlockedAchievement.rarity === 'uncommon' ? 'bg-blue-900' :
                    showUnlockedAchievement.rarity === 'rare' ? 'bg-purple-900' :
                    'bg-amber-900'
                  }`}>
                    {showUnlockedAchievement.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{showUnlockedAchievement.name}</h3>
                    <p className="text-sm text-slate-400">{showUnlockedAchievement.description}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowUnlockedAchievement(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}