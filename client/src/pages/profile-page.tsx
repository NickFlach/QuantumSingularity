import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { UpdateUserProfile, User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Container } from '@/components/ui/container';
import {
  Atom,
  Award,
  BookOpen,
  BrainCircuit,
  Dna,
  Loader2,
  Lock,
  Sparkles,
  User as UserIcon,
  Wand2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuantumCircuitVisualizer } from '@/components/QuantumCircuitVisualizer';

// Quantum personas with descriptions
const QUANTUM_PERSONAS = [
  {
    id: 'quantum_architect',
    name: 'Quantum Architect',
    description: 'Masters of quantum circuit design and optimization',
    icon: <Atom className="h-5 w-5 text-[#89B4FA]" />,
    color: '#89B4FA',
  },
  {
    id: 'entanglement_engineer',
    name: 'Entanglement Engineer',
    description: 'Specialists in quantum entanglement and teleportation',
    icon: <Dna className="h-5 w-5 text-[#F38BA8]" />,
    color: '#F38BA8',
  },
  {
    id: 'ai_harmonizer',
    name: 'AI Harmonizer',
    description: 'Experts in quantum-enhanced AI systems integration',
    icon: <BrainCircuit className="h-5 w-5 text-[#A6E3A1]" />,
    color: '#A6E3A1',
  },
  {
    id: 'quantum_theorist',
    name: 'Quantum Theorist',
    description: 'Visionaries exploring the quantum theory frontiers',
    icon: <BookOpen className="h-5 w-5 text-[#CBA6F7]" />,
    color: '#CBA6F7',
  },
  {
    id: 'singularity_coder',
    name: 'Singularity Coder',
    description: 'Masters of SINGULARIS PRIME language development',
    icon: <Wand2 className="h-5 w-5 text-[#FAB387]" />,
    color: '#FAB387',
  },
];

// Specialization options
const SPECIALIZATIONS = [
  { id: 'quantum_circuits', name: 'Quantum Circuits', color: '#89B4FA' },
  { id: 'quantum_algorithms', name: 'Quantum Algorithms', color: '#F38BA8' },
  { id: 'ai_governance', name: 'AI Governance', color: '#A6E3A1' },
  { id: 'quantum_ml', name: 'Quantum Machine Learning', color: '#CBA6F7' },
  { id: 'singularis_language', name: 'SINGULARIS PRIME Language', color: '#FAB387' },
  { id: 'quantum_error_correction', name: 'Quantum Error Correction', color: '#F9E2AF' },
  { id: 'quantum_visualization', name: 'Quantum Visualization', color: '#94E2D5' },
  { id: 'quantum_cryptography', name: 'Quantum Cryptography', color: '#74C7EC' },
];

// Avatar color options
const AVATAR_COLORS = [
  { value: '#89B4FA', label: 'Quantum Blue' },
  { value: '#F38BA8', label: 'Entanglement Pink' },
  { value: '#A6E3A1', label: 'Superposition Green' },
  { value: '#CBA6F7', label: 'Singularity Purple' },
  { value: '#FAB387', label: 'Paradox Orange' },
  { value: '#F9E2AF', label: 'Wave Function Yellow' },
  { value: '#74C7EC', label: 'Quantum Field Cyan' },
];

// Extended profile schema
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional().or(z.literal('')),
  avatarColor: z.string().optional(),
  quantumPersona: z.string().optional(),
  specializations: z.array(z.string()).max(3, 'You can select up to 3 specializations').optional(),
});

// Achievement definition
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  dateUnlocked?: string;
  color: string;
}

// Placeholder user stats
interface UserStats {
  projectsCreated: number;
  circuitsDesigned: number;
  codeExecutions: number;
  quantumLevel: number;
  quantum_xp: number;
  quantum_xp_next: number;
  joinDate: string;
  lastActive: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Placeholder stats and achievements - In a real app, these would come from the API
  const [stats, setStats] = useState<UserStats>({
    projectsCreated: 7,
    circuitsDesigned: 12,
    codeExecutions: 189,
    quantumLevel: 4,
    quantum_xp: 1450,
    quantum_xp_next: 2000,
    joinDate: 'March 15, 2025',
    lastActive: 'Today',
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_circuit',
      name: 'Quantum Initiate',
      description: 'Design your first quantum circuit',
      icon: <Atom />,
      unlocked: true,
      dateUnlocked: 'Mar 16, 2025',
      color: '#89B4FA',
    },
    {
      id: 'entanglement_master',
      name: 'Entanglement Master',
      description: 'Successfully create a maximally entangled state',
      icon: <Dna />,
      unlocked: true,
      dateUnlocked: 'Mar 18, 2025',
      color: '#F38BA8',
    },
    {
      id: 'code_contributor',
      name: 'Code Contributor',
      description: 'Write 500 lines of SINGULARIS PRIME code',
      icon: <Wand2 />,
      unlocked: false,
      progress: 324,
      maxProgress: 500,
      color: '#A6E3A1',
    },
    {
      id: 'quantum_explorer',
      name: 'Quantum Explorer',
      description: 'Try all quantum circuit templates',
      icon: <Sparkles />,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      color: '#CBA6F7',
    },
    {
      id: 'ai_governance',
      name: 'AI Governance Pioneer',
      description: 'Successfully complete an AI contract negotiation with 100% explainability',
      icon: <BrainCircuit />,
      unlocked: false,
      color: '#FAB387',
    },
  ]);
  
  // Define the form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || user?.username || '',
      bio: userProfile?.bio || '',
      avatarColor: userProfile?.avatarColor || '#89B4FA',
      quantumPersona: userProfile?.quantumPersona || '',
      specializations: userProfile?.specializations as string[] || [],
    },
  });
  
  // Fetch user profile on load
  useEffect(() => {
    if (user) {
      // In a real app, you would fetch the user profile from the server
      // Here we'll just set it to the user data we already have
      setUserProfile({
        ...user,
        displayName: user.displayName || user.username,
        bio: user.bio || "Quantum explorer in the SINGULARIS PRIME universe",
        avatarColor: user.avatarColor || "#89B4FA",
        quantumPersona: user.quantumPersona || "quantum_architect",
        specializations: user.specializations || ["quantum_circuits", "quantum_algorithms"],
        quantumLevel: user.quantumLevel || 4,
        achievements: user.achievements || [],
      });
      
      // Reset form with new data
      form.reset({
        displayName: user.displayName || user.username,
        bio: user.bio || "Quantum explorer in the SINGULARIS PRIME universe",
        avatarColor: user.avatarColor || "#89B4FA",
        quantumPersona: user.quantumPersona || "quantum_architect",
        specializations: user.specializations as string[] || ["quantum_circuits", "quantum_algorithms"],
      });
    }
  }, [user, form]);
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      // In a real app, you would update the user profile on the server
      const response = await apiRequest('PUT', '/api/user/profile', data);
      
      // Update local state
      setUserProfile({
        ...userProfile!,
        ...data,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your quantum persona has been updated successfully',
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (editMode) {
      form.reset({
        displayName: userProfile?.displayName || user?.username || '',
        bio: userProfile?.bio || '',
        avatarColor: userProfile?.avatarColor || '#89B4FA',
        quantumPersona: userProfile?.quantumPersona || '',
        specializations: userProfile?.specializations as string[] || [],
      });
    }
    setEditMode(!editMode);
  };
  
  // Quantum Level progress calculation
  const levelProgress = (stats.quantum_xp / stats.quantum_xp_next) * 100;
  
  // Avatar display and initials calculation
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get current persona data
  const currentPersona = QUANTUM_PERSONAS.find(p => p.id === userProfile?.quantumPersona) || QUANTUM_PERSONAS[0];
  
  // User specializations
  const userSpecializations = SPECIALIZATIONS.filter(spec => 
    (userProfile?.specializations as string[] || []).includes(spec.id)
  );
  
  if (!user) {
    return (
      <Container>
        <div className="py-24 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">Authentication Required</h1>
          <p className="mt-2 text-muted-foreground">Please login to view your profile</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Quantum Persona</h1>
          <p className="text-muted-foreground">
            Your identity in the SINGULARIS PRIME universe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 bg-[#1E1E2E] border-[#313244]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <CardTitle className="text-[#CDD6F4]">
                    {userProfile?.displayName || user.username}
                  </CardTitle>
                  <CardDescription className="text-[#A6ADC8]">
                    {currentPersona.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleEditMode}
                  className="bg-[#313244] hover:bg-[#45475A] text-[#CDD6F4]"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-[#313244]" style={{ backgroundColor: userProfile?.avatarColor || '#89B4FA' }}>
                    <AvatarFallback className="text-3xl text-[#1E1E2E]">
                      {getInitials(userProfile?.displayName || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-[#1E1E2E] rounded-full p-1 border-2 border-[#313244]">
                    {currentPersona.icon}
                  </div>
                </div>
                
                <div className="mt-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-[#FAB387]" />
                    <span className="text-[#FAB387] font-medium">Level {stats.quantumLevel}</span>
                  </div>
                  <div className="w-48 h-2 bg-[#313244] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#89B4FA] to-[#FAB387]"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#A6ADC8]">
                    {stats.quantum_xp} / {stats.quantum_xp_next} XP
                  </p>
                </div>
              </div>
              
              <Separator className="bg-[#313244]" />
              
              {!editMode ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#CDD6F4] mb-1">Bio</h3>
                    <p className="text-sm text-[#A6ADC8]">{userProfile?.bio || "No bio yet"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[#CDD6F4] mb-1">Specializations</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {userSpecializations.length > 0 ? userSpecializations.map(spec => (
                        <Badge 
                          key={spec.id}
                          variant="outline"
                          style={{ backgroundColor: spec.color + '30', borderColor: spec.color }}
                          className="text-[#CDD6F4]"
                        >
                          {spec.name}
                        </Badge>
                      )) : (
                        <p className="text-sm text-[#A6ADC8]">No specializations selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[#CDD6F4] mb-1">Stats</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#A6ADC8]">Projects</span>
                        <span className="text-[#CDD6F4]">{stats.projectsCreated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6ADC8]">Circuits</span>
                        <span className="text-[#CDD6F4]">{stats.circuitsDesigned}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6ADC8]">Executions</span>
                        <span className="text-[#CDD6F4]">{stats.codeExecutions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6ADC8]">Joined</span>
                        <span className="text-[#CDD6F4]">{stats.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#CDD6F4]">Display Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-[#313244] border-[#45475A] text-[#CDD6F4]"
                              placeholder="Your display name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#CDD6F4]">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-[#313244] border-[#45475A] text-[#CDD6F4]"
                              placeholder="A short bio about yourself"
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription className="text-[#A6ADC8]">
                            Max 300 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="avatarColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#CDD6F4]">Avatar Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#313244] border-[#45475A] text-[#CDD6F4]">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <SelectValue placeholder="Select color" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#1E1E2E] border-[#313244]">
                              {AVATAR_COLORS.map(color => (
                                <SelectItem
                                  key={color.value}
                                  value={color.value}
                                  className="text-[#CDD6F4]"
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: color.value }}
                                    />
                                    <span>{color.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantumPersona"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#CDD6F4]">Quantum Persona</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#313244] border-[#45475A] text-[#CDD6F4]">
                                <SelectValue placeholder="Select persona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#1E1E2E] border-[#313244]">
                              {QUANTUM_PERSONAS.map(persona => (
                                <SelectItem
                                  key={persona.id}
                                  value={persona.id}
                                  className="text-[#CDD6F4]"
                                >
                                  <div className="flex items-center gap-2">
                                    {persona.icon}
                                    <span>{persona.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-[#A6ADC8]">
                            Your role in the quantum universe
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specializations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#CDD6F4]">Specializations (Max 3)</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {SPECIALIZATIONS.map(spec => (
                              <div
                                key={spec.id}
                                className={`cursor-pointer flex items-center gap-2 p-2 rounded-md transition 
                                  ${(field.value || []).includes(spec.id) 
                                    ? `bg-[${spec.color}30] border border-[${spec.color}] text-[#CDD6F4]` 
                                    : 'bg-[#313244] text-[#A6ADC8]'
                                  }`}
                                style={{
                                  backgroundColor: (field.value || []).includes(spec.id) 
                                    ? `${spec.color}30` 
                                    : '#313244',
                                  borderColor: (field.value || []).includes(spec.id) 
                                    ? spec.color 
                                    : 'transparent'
                                }}
                                onClick={() => {
                                  const currentValue = field.value || [];
                                  if (currentValue.includes(spec.id)) {
                                    field.onChange(currentValue.filter(id => id !== spec.id));
                                  } else if (currentValue.length < 3) {
                                    field.onChange([...currentValue, spec.id]);
                                  }
                                }}
                              >
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: spec.color }}
                                />
                                <span className="text-xs">{spec.name}</span>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2 flex gap-2">
                      <Button
                        type="submit"
                        className="bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90 flex-1"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Profile
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-[#313244] hover:bg-[#45475A] text-[#CDD6F4]"
                        onClick={toggleEditMode}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs 
              defaultValue="overview" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-[#313244]">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-[#45475A] text-[#CDD6F4]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="data-[state=active]:bg-[#45475A] text-[#CDD6F4]"
                >
                  Achievements
                </TabsTrigger>
                <TabsTrigger 
                  value="circuits" 
                  className="data-[state=active]:bg-[#45475A] text-[#CDD6F4]"
                >
                  My Circuits
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card className="bg-[#1E1E2E] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-[#CDD6F4] flex items-center gap-2">
                      {currentPersona.icon}
                      <span>{currentPersona.name}</span>
                    </CardTitle>
                    <CardDescription className="text-[#A6ADC8]">
                      {currentPersona.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      className="rounded-md p-4"
                      style={{ backgroundColor: `${currentPersona.color}15` }}
                    >
                      <p className="text-sm text-[#CDD6F4] leading-relaxed">
                        As a <span className="font-medium" style={{ color: currentPersona.color }}>{currentPersona.name}</span>,
                        you excel at crafting precise quantum operations that push the boundaries of computation.
                        Your understanding of quantum superposition and circuit design enables you to create elegant
                        solutions to complex problems.
                      </p>
                    </div>
                    
                    <Separator className="bg-[#313244]" />
                    
                    <div>
                      <h3 className="text-sm font-medium text-[#CDD6F4] mb-2">Persona Benefits</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#313244] rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Sparkles className="h-4 w-4" style={{ color: currentPersona.color }} />
                            <h4 className="text-sm font-medium text-[#CDD6F4]">Circuit Optimization</h4>
                          </div>
                          <p className="text-xs text-[#A6ADC8]">Enhanced ability to optimize quantum circuits for improved efficiency</p>
                        </div>
                        
                        <div className="bg-[#313244] rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Sparkles className="h-4 w-4" style={{ color: currentPersona.color }} />
                            <h4 className="text-sm font-medium text-[#CDD6F4]">AI Collaboration</h4>
                          </div>
                          <p className="text-xs text-[#A6ADC8]">Improved integration between quantum circuits and AI systems</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#1E1E2E] border-[#313244]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[#CDD6F4] text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4 text-[#FAB387]" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {achievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
                        <div key={achievement.id} className="flex items-start gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center mt-1"
                            style={{ backgroundColor: achievement.color }}
                          >
                            {achievement.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[#CDD6F4]">{achievement.name}</h4>
                            <p className="text-xs text-[#A6ADC8]">{achievement.description}</p>
                            <p className="text-xs mt-1" style={{ color: achievement.color }}>
                              Unlocked on {achievement.dateUnlocked}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 bg-[#313244] hover:bg-[#45475A] text-[#CDD6F4]"
                        onClick={() => setActiveTab('achievements')}
                      >
                        View All Achievements
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1E1E2E] border-[#313244]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[#CDD6F4] text-sm font-medium flex items-center gap-2">
                        <Dna className="h-4 w-4 text-[#89B4FA]" />
                        Quantum Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-[#313244] rounded-md p-3">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-medium text-[#CDD6F4]">Quantum XP</h4>
                            <p className="text-xs text-[#A6ADC8]">{stats.quantum_xp} / {stats.quantum_xp_next}</p>
                          </div>
                          <div className="w-full h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#89B4FA] to-[#CBA6F7]"
                              style={{ width: `${levelProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-[#A6ADC8] mt-1.5">
                            {Math.floor(stats.quantum_xp_next - stats.quantum_xp)} XP until next level
                          </p>
                        </div>
                        
                        <div className="bg-[#313244] rounded-md p-3">
                          <h4 className="text-sm font-medium text-[#CDD6F4] mb-2">Your Path to Level 5</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-[#A6E3A1] flex items-center justify-center text-xs text-[#1E1E2E] font-medium">✓</div>
                              <p className="text-xs text-[#A6ADC8]">Create a quantum circuit</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-[#A6E3A1] flex items-center justify-center text-xs text-[#1E1E2E] font-medium">✓</div>
                              <p className="text-xs text-[#A6ADC8]">Execute SINGULARIS PRIME code</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-[#313244] flex items-center justify-center text-xs text-[#A6ADC8] font-medium">3</div>
                              <p className="text-xs text-[#A6ADC8]">Optimize 3 more quantum circuits</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="space-y-4 mt-4">
                <Card className="bg-[#1E1E2E] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-[#CDD6F4] flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#FAB387]" />
                      <span>Quantum Achievements</span>
                    </CardTitle>
                    <CardDescription className="text-[#A6ADC8]">
                      Your accomplishments in the SINGULARIS PRIME universe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {/* Unlocked achievements */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-[#CDD6F4]">Unlocked</h3>
                          {achievements.filter(a => a.unlocked).map(achievement => (
                            <div 
                              key={achievement.id} 
                              className="flex items-start gap-4 p-3 rounded-md"
                              style={{ backgroundColor: `${achievement.color}15` }}
                            >
                              <div
                                className="w-10 h-10 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: achievement.color }}
                              >
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-[#CDD6F4]">{achievement.name}</h4>
                                  <Badge 
                                    variant="outline"
                                    className="ml-auto"
                                    style={{ backgroundColor: `${achievement.color}30`, borderColor: achievement.color }}
                                  >
                                    Unlocked
                                  </Badge>
                                </div>
                                <p className="text-xs text-[#A6ADC8] mt-1">{achievement.description}</p>
                                {achievement.dateUnlocked && (
                                  <p className="text-xs mt-2" style={{ color: achievement.color }}>
                                    Unlocked on {achievement.dateUnlocked}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* In progress achievements */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-[#CDD6F4]">In Progress</h3>
                          {achievements.filter(a => !a.unlocked && a.progress).map(achievement => (
                            <div 
                              key={achievement.id} 
                              className="flex items-start gap-4 p-3 rounded-md bg-[#313244]"
                            >
                              <div
                                className="w-10 h-10 rounded-md flex items-center justify-center bg-[#45475A]"
                              >
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-[#CDD6F4]">{achievement.name}</h4>
                                  <Badge 
                                    variant="outline"
                                    className="ml-auto bg-[#45475A]"
                                  >
                                    {Math.round((achievement.progress! / achievement.maxProgress!) * 100)}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-[#A6ADC8] mt-1">{achievement.description}</p>
                                <div className="w-full h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden mt-2">
                                  <div 
                                    className="h-full bg-[#89B4FA]"
                                    style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                                  />
                                </div>
                                <p className="text-xs text-[#A6ADC8] mt-1.5">
                                  {achievement.progress} / {achievement.maxProgress}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Locked achievements */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-[#CDD6F4]">Locked</h3>
                          {achievements.filter(a => !a.unlocked && !a.progress).map(achievement => (
                            <div 
                              key={achievement.id} 
                              className="flex items-start gap-4 p-3 rounded-md bg-[#313244]"
                            >
                              <div
                                className="w-10 h-10 rounded-md flex items-center justify-center bg-[#45475A]"
                              >
                                {achievement.icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-[#CDD6F4]">{achievement.name}</h4>
                                <p className="text-xs text-[#A6ADC8] mt-1">{achievement.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="circuits" className="space-y-4 mt-4">
                <Card className="bg-[#1E1E2E] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-[#CDD6F4] flex items-center gap-2">
                      <Atom className="h-5 w-5 text-[#89B4FA]" />
                      <span>My Quantum Circuits</span>
                    </CardTitle>
                    <CardDescription className="text-[#A6ADC8]">
                      Quantum circuits you've designed and simulated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Example circuit */}
                      <Card className="bg-[#313244] border-[#45475A]">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-[#CDD6F4]">Bell State Generator</CardTitle>
                            <Badge variant="outline" className="bg-[#1E1E2E]">2 qubits</Badge>
                          </div>
                          <CardDescription className="text-xs text-[#A6ADC8]">
                            Created 2 days ago • Last run 6 hours ago
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <QuantumCircuitVisualizer
                            gates={[
                              { id: 'h1', type: 'H', qubit: 0, position: 0, color: '#89B4FA' },
                              { id: 'cnot1', type: 'CNOT', qubit: 1, position: 1, controlQubit: 0, color: '#FAB387' }
                            ]}
                            numQubits={2}
                            stateProbabilities={{ '00': 0.5, '11': 0.5 }}
                          />
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs bg-[#1E1E2E] hover:bg-[#313244] text-[#CDD6F4]"
                          >
                            Edit Circuit
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      {/* Example circuit 2 */}
                      <Card className="bg-[#313244] border-[#45475A]">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-[#CDD6F4]">GHZ State Preparation</CardTitle>
                            <Badge variant="outline" className="bg-[#1E1E2E]">3 qubits</Badge>
                          </div>
                          <CardDescription className="text-xs text-[#A6ADC8]">
                            Created 1 week ago • Last run 2 days ago
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <QuantumCircuitVisualizer
                            gates={[
                              { id: 'h1', type: 'H', qubit: 0, position: 0, color: '#89B4FA' },
                              { id: 'cnot1', type: 'CNOT', qubit: 1, position: 1, controlQubit: 0, color: '#FAB387' },
                              { id: 'cnot2', type: 'CNOT', qubit: 2, position: 2, controlQubit: 0, color: '#FAB387' }
                            ]}
                            numQubits={3}
                            stateProbabilities={{ '000': 0.5, '111': 0.5 }}
                          />
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs bg-[#1E1E2E] hover:bg-[#313244] text-[#CDD6F4]"
                          >
                            Edit Circuit
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Button 
                        className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
                      >
                        Design New Circuit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Container>
  );
}