import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  User, 
  Atom, 
  Shield, 
  Code, 
  BarChart, 
  Award, 
  Brain, 
  Clock, 
  Ghost, 
  Cog, 
  User as UserIcon
} from "lucide-react";

// Define achievement type
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

// Define user stats type
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

// Define the form validation schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }).optional(),
  avatarColor: z.string().regex(/^#([0-9A-F]{6})$/i, {
    message: "Please select a valid color.",
  }),
  quantumPersona: z.string().optional(),
  specializations: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Quantum personas available for users
const quantumPersonas = [
  { 
    id: "quantum_architect", 
    name: "Quantum Architect", 
    description: "Master of quantum circuit design and optimization",
    icon: <Atom className="text-cyan-500" /> 
  },
  { 
    id: "ai_governance", 
    name: "AI Governance Specialist", 
    description: "Expert in AI contract formation and explainability",
    icon: <Shield className="text-violet-500" /> 
  },
  { 
    id: "singularis_coder", 
    name: "SINGULARIS Coder", 
    description: "Proficient in the SINGULARIS PRIME language",
    icon: <Code className="text-green-500" /> 
  },
  { 
    id: "quantum_analyst", 
    name: "Quantum Data Analyst", 
    description: "Specialist in quantum data visualization and interpretation",
    icon: <BarChart className="text-amber-500" /> 
  },
  { 
    id: "interplanetary_communicator", 
    name: "Interplanetary Protocol Designer", 
    description: "Designer of communication protocols that work across vast distances",
    icon: <Ghost className="text-rose-500" /> 
  },
];

// Available specializations
const specializations = [
  "Quantum Circuit Design",
  "AI Contract Negotiation",
  "SINGULARIS PRIME Language",
  "Quantum Data Visualization",
  "Interplanetary Communication",
  "Quantum Error Correction",
  "AI Explainability Analysis"
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");
  
  // Create demo achievements (in a real app, these would come from the backend)
  const achievements: Achievement[] = [
    {
      id: "first_circuit",
      name: "Quantum Pioneer",
      description: "Created your first quantum circuit",
      icon: <Atom />,
      unlocked: true,
      dateUnlocked: "2025-03-24",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      id: "first_project",
      name: "Project Founder",
      description: "Created your first SINGULARIS PRIME project",
      icon: <Code />,
      unlocked: true,
      dateUnlocked: "2025-03-24",
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      id: "ai_negotiation",
      name: "AI Diplomat",
      description: "Successfully mediated an AI-to-AI negotiation",
      icon: <Brain />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      id: "circuit_master",
      name: "Circuit Master",
      description: "Created 10 optimized quantum circuits",
      icon: <Award />,
      unlocked: false,
      progress: 2,
      maxProgress: 10,
      color: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
    {
      id: "code_executor",
      name: "SINGULARIS Adept",
      description: "Executed 50 SINGULARIS PRIME code snippets",
      icon: <Clock />,
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      color: "bg-gradient-to-r from-red-500 to-rose-500"
    },
  ];
  
  // Create demo user stats (in a real app, these would come from the backend)
  const userStats: UserStats = {
    projectsCreated: 2,
    circuitsDesigned: 5,
    codeExecutions: 24,
    quantumLevel: user?.quantumLevel || 1,
    quantum_xp: 240,
    quantum_xp_next: 500,
    joinDate: user?.createdAt || new Date().toISOString(),
    lastActive: user?.lastActive || new Date().toISOString()
  };
  
  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
      bio: user?.bio || "",
      avatarColor: user?.avatarColor || "#89B4FA", 
      quantumPersona: user?.quantumPersona || "",
      specializations: user?.specializations as string[] || [],
    },
  });
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || user.username,
        bio: user.bio || "",
        avatarColor: user.avatarColor || "#89B4FA",
        quantumPersona: user.quantumPersona || "",
        specializations: user.specializations as string[] || [],
      });
    }
  }, [user, form]);
  
  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  }
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Profile header */}
        <Card className="w-full sm:w-64">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2" style={{ backgroundColor: user.avatarColor || '#89B4FA' }}>
              <AvatarFallback className="text-2xl">
                {getInitials(user.displayName || user.username)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-2">{user.displayName || user.username}</h2>
            {user.quantumPersona && (
              <div className="flex items-center mt-1 text-muted-foreground text-sm">
                {quantumPersonas.find(p => p.id === user.quantumPersona)?.icon}
                <span className="ml-1">{quantumPersonas.find(p => p.id === user.quantumPersona)?.name}</span>
              </div>
            )}
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Level {userStats.quantumLevel}</span>
                <span>{userStats.quantum_xp} / {userStats.quantum_xp_next} XP</span>
              </div>
              <Progress 
                value={(userStats.quantum_xp / userStats.quantum_xp_next) * 100} 
                className="h-2 bg-muted" 
              />
            </div>
            <div className="w-full mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{new Date(userStats.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projects</span>
                <span>{userStats.projectsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Circuits</span>
                <span>{userStats.circuitsDesigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Executions</span>
                <span>{userStats.codeExecutions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content */}
        <div className="flex-1">
          <Tabs defaultValue="profile" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Cog className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            {/* Profile edit tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and quantum persona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
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
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself"
                                className="resize-none"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Briefly describe your interests in quantum computing or AI
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
                            <FormLabel>Avatar Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border" 
                                style={{ backgroundColor: field.value }}
                              />
                              <FormControl>
                                <Input 
                                  type="color"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quantumPersona"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantum Persona</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || ""}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a persona" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No Persona Selected</SelectItem>
                                {quantumPersonas.map(persona => (
                                  <SelectItem key={persona.id} value={persona.id}>
                                    <div className="flex items-center gap-2">
                                      {persona.icon}
                                      <span>{persona.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Your quantum persona represents your primary focus area
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
                            <FormLabel>Specializations</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {specializations.map(specialization => {
                                const isSelected = field.value?.includes(specialization);
                                return (
                                  <Badge 
                                    key={specialization}
                                    variant={isSelected ? "default" : "outline"}
                                    className="cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                      const currentValues = field.value || [];
                                      if (isSelected) {
                                        field.onChange(currentValues.filter(v => v !== specialization));
                                      } else {
                                        field.onChange([...currentValues, specialization]);
                                      }
                                    }}
                                  >
                                    {specialization}
                                  </Badge>
                                );
                              })}
                            </div>
                            <FormDescription>
                              Select your areas of expertise in quantum computing and AI
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Achievements tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Track your progress and accomplishments in SINGULARIS PRIME
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(achievement => (
                      <Card key={achievement.id} className="overflow-hidden">
                        <div 
                          className={`h-2 w-full ${achievement.unlocked ? achievement.color : "bg-muted"}`}
                        />
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${achievement.unlocked ? achievement.color : "bg-muted"} text-white`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{achievement.name}</h3>
                                {achievement.unlocked ? (
                                  <Badge variant="secondary">Unlocked</Badge>
                                ) : (
                                  <Badge variant="outline">In Progress</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {achievement.description}
                              </p>
                              
                              {!achievement.unlocked && achievement.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                                  </div>
                                  <Progress 
                                    value={(achievement.progress / achievement.maxProgress!) * 100} 
                                    className="h-2 bg-muted" 
                                  />
                                </div>
                              )}
                              
                              {achievement.unlocked && achievement.dateUnlocked && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Unlocked on {new Date(achievement.dateUnlocked).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications about your activity
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Achievement Alerts</h3>
                        <p className="text-sm text-muted-foreground">
                          Show in-app notifications for new achievements
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Quantum Insights</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive AI-generated tips based on your activity
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Circuit Optimization Suggestions</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive optimization suggestions for your quantum circuits
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}