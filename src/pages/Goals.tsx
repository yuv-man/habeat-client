import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Plus, 
  CheckCircle, 
  Trophy, 
  Calendar,
  Edit,
  Trash2,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  type: 'weight' | 'calories' | 'workout' | 'water' | 'custom';
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Goals = () => {
  const navigate = useNavigate();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Lose 5kg',
      description: 'Reach my target weight',
      target: 5,
      current: 2,
      unit: 'kg',
      type: 'weight',
      deadline: '2024-03-01',
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Drink 8 glasses daily',
      description: 'Stay hydrated throughout the day',
      target: 8,
      current: 6,
      unit: 'glasses',
      type: 'water',
      deadline: '2024-02-01',
      completed: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Exercise 5 times a week',
      description: 'Build a consistent workout routine',
      target: 20,
      current: 15,
      unit: 'sessions',
      type: 'workout',
      deadline: '2024-02-29',
      completed: false,
      priority: 'high'
    },
    {
      id: '4',
      title: '30-day streak',
      description: 'Complete daily nutrition goals',
      target: 30,
      current: 30,
      unit: 'days',
      type: 'custom',
      deadline: '2024-01-31',
      completed: true,
      priority: 'high'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight': return '⚖️';
      case 'calories': return '🍎';
      case 'workout': return '💪';
      case 'water': return '💧';
      default: return '🎯';
    }
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const activeGoals = goals.filter(goal => !goal.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Goals & Achievements</h1>
            <p className="opacity-90">Track your progress and celebrate milestones</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAddGoal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <div className="text-sm opacity-80">Active Goals</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{completedGoals.length}</div>
            <div className="text-sm opacity-80">Completed</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {Math.round((completedGoals.length / goals.length) * 100)}%
            </div>
            <div className="text-sm opacity-80">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Active Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Active Goals
            </CardTitle>
            <CardDescription>Your current objectives and their progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getTypeIcon(goal.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.current} / {goal.target} {goal.unit}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
            <CardDescription>Goals you've successfully completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-green-800">{goal.title}</div>
                    <div className="text-sm text-green-600">{goal.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Goal Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Goal Templates</CardTitle>
            <CardDescription>Start with popular goal templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '⚖️', title: 'Weight Loss', desc: 'Set a target weight to reach' },
                { icon: '💪', title: 'Workout Streak', desc: 'Build consistent exercise habits' },
                { icon: '💧', title: 'Hydration Goal', desc: 'Stay hydrated daily' },
                { icon: '🥗', title: 'Meal Prep', desc: 'Prepare healthy meals weekly' },
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={() => setShowAddGoal(true)}
                >
                  <span className="text-2xl mr-3">{template.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{template.title}</div>
                    <div className="text-sm text-muted-foreground">{template.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back button */}
      <div className="fixed bottom-6 left-6">
        <Button onClick={() => navigate('/dashboard')} className="rounded-full">
          ← Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Goals;