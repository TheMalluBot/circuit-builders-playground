
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  TrendingUp,
  Plus,
  FileText,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";

// Mock data for the dashboard
const summaryData = {
  activeUsers: 1289,
  lessonCompletionRate: 68,
  newRegistrations: 124,
  topLessons: [
    { id: 1, title: "Introduction to Electronics", completions: 456 },
    { id: 2, title: "Basic Circuit Components", completions: 342 },
    { id: 3, title: "Ohm's Law and Resistors", completions: 298 }
  ],
  recentActivity: [
    { id: 1, type: "lesson_published", title: "Digital Logic Gates", user: "Admin User", time: "2 hours ago" },
    { id: 2, type: "user_registered", user: "John Smith", time: "4 hours ago" },
    { id: 3, type: "lesson_updated", title: "Capacitors in Action", user: "Admin User", time: "5 hours ago" },
    { id: 4, type: "user_registered", user: "Jane Doe", time: "6 hours ago" },
    { id: 5, type: "lesson_published", title: "Transistor Basics", user: "Admin User", time: "1 day ago" }
  ]
};

const AdminDashboard = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your educational platform and recent activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-5">
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Lesson Completion</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{summaryData.lessonCompletionRate}%</div>
                <Progress value={summaryData.lessonCompletionRate} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.newRegistrations}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Top Performing</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Electronics 101</div>
                <p className="text-xs text-muted-foreground">
                  456 completions
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently performed tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4 gap-2">
                <Plus className="h-5 w-5" />
                Create Lesson
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4 gap-2">
                <FileText className="h-5 w-5" />
                Publish Content
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4 gap-2">
                <Eye className="h-5 w-5" />
                View Reports
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4 gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                The latest updates and changes on your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summaryData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-muted rounded-full p-2">
                      {activity.type === "lesson_published" || activity.type === "lesson_updated" ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.type === "lesson_published" && "New lesson published"}
                        {activity.type === "lesson_updated" && "Lesson updated"}
                        {activity.type === "user_registered" && "New user registration"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.title && `"${activity.title}" by `}
                        {activity.user}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed metrics for your educational content</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Analytics charts will be displayed here</p>
                <Button variant="outline">Load Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Complete history of platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                      {i !== 9 && <div className="bg-border w-px h-full" />}
                    </div>
                    <div className="pb-8">
                      <p className="text-sm font-medium">Activity Example {i + 1}</p>
                      <p className="text-xs text-muted-foreground">{i + 1} hour(s) ago</p>
                      <p className="text-sm mt-2">
                        {i % 3 === 0 && "Lesson content updated"}
                        {i % 3 === 1 && "New user registered"}
                        {i % 3 === 2 && "Simulation created"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bottom Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Top Performing Lessons</CardTitle>
            <CardDescription>
              Lessons with the highest completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.topLessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center">
                  <div className="w-6 text-muted-foreground">{i + 1}.</div>
                  <div className="flex-1 ml-2">{lesson.title}</div>
                  <div className="ml-auto flex items-center">
                    <CheckCircle className="text-primary w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{lesson.completions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Lessons</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>
              Daily active users and session metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">User engagement chart will be displayed here</p>
              <Button variant="outline">View Details</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
