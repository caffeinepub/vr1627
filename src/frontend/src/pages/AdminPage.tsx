import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart2,
  Film,
  Image,
  Loader2,
  LogOut,
  MessageSquare,
  Phone,
  Shield,
  Type,
  User,
} from "lucide-react";
import { useState } from "react";
import AdminAboutTab from "../components/admin/AdminAboutTab";
import AdminContactTab from "../components/admin/AdminContactTab";
import AdminPhotoTab from "../components/admin/AdminPhotoTab";
import AdminResultsTab from "../components/admin/AdminResultsTab";
import AdminSiteTextTab from "../components/admin/AdminSiteTextTab";
import AdminSubmissionsTab from "../components/admin/AdminSubmissionsTab";
import AdminVideoTab from "../components/admin/AdminVideoTab";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMetaTags } from "../hooks/useMetaTags";
import { useIsAdmin } from "../hooks/useQueries";

function AdminLoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-black text-3xl gradient-text mb-2">
            Admin Login
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to access the VR1627 control panel.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all hover:shadow-blue-glow"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>

          <Link to="/" className="block">
            <Button variant="ghost" className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedScreen() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-display font-black text-2xl mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You don't have admin permissions for this portfolio.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Link to="/">
            <Button variant="ghost" className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "videos", label: "Videos", icon: Film },
  { id: "photos", label: "Photos", icon: Image },
  { id: "results", label: "Results", icon: BarChart2 },
  { id: "about", label: "About", icon: User },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "submissions", label: "Inbox", icon: MessageSquare },
  { id: "sitetext", label: "Site Text", icon: Type },
];

export default function AdminPage() {
  useMetaTags({ title: "Admin | VR1627" });

  const { identity, clear, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("videos");

  const isAuthenticated = !!identity;

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  // Loading state
  if (isInitializing || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <AdminLoginScreen />;
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="sticky top-0 z-40 glass border-b border-border/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Portfolio</span>
            </Link>
            <div className="w-px h-4 bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/vr1627-logo-transparent.dim_200x200.png"
                alt="VR1627"
                className="w-6 h-6 object-contain"
              />
              <span className="font-display font-bold text-sm">
                Control Panel
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab nav */}
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 mb-8 glass rounded-2xl w-full md:w-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="videos">
            <AdminVideoTab />
          </TabsContent>
          <TabsContent value="photos">
            <AdminPhotoTab />
          </TabsContent>
          <TabsContent value="results">
            <AdminResultsTab />
          </TabsContent>
          <TabsContent value="about">
            <AdminAboutTab />
          </TabsContent>
          <TabsContent value="contact">
            <AdminContactTab />
          </TabsContent>
          <TabsContent value="submissions">
            <AdminSubmissionsTab />
          </TabsContent>
          <TabsContent value="sitetext">
            <AdminSiteTextTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
