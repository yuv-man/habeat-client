import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Target } from "lucide-react";
import foodBg from "@/assets/food-bg.webp";
//import logo from "@/assets/habeatIcon.png";
import logo from "@/assets/logos/app1.webp";
import { features } from "@/lib/paths";
import {
  HABEAT_SLOGAN,
  SLOGAN_NO_GUILT,
  SLOGAN_EAT_WELL,
  SLOGAN_HABITS,
} from "@/lib/copy";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/stores/authStore";
import { isNativePlatform } from "@/lib/platform";
import MealLoader from "@/components/helper/MealLoader";

const Index = () => {
  const navigate = useNavigate();
  const { user, token, loading } = useAuthStore();
  const isMobile = isNativePlatform();

  // Check authentication status on mount (mobile only)
  useEffect(() => {
    if (!isMobile) {
      // On web, show landing page immediately
      return;
    }

    // On mobile, check auth and redirect if authenticated
    const checkAuth = () => {
      const {
        user: currentUser,
        token: currentToken,
        loading: currentLoading,
      } = useAuthStore.getState();

      // If still loading, wait a bit more
      if (currentLoading) {
        setTimeout(checkAuth, 100);
        return;
      }

      // Auth check is complete - redirect if authenticated
      if (currentUser && currentToken) {
        navigate("/daily-tracker");
      }
      // If not authenticated, show login page (component will render normally)
    };

    checkAuth();
  }, [isMobile, navigate]);

  // Show loading screen on mobile while checking auth
  if (isMobile && (loading || (token && !user))) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MealLoader customMessages={["Loading..."]} />
        </div>
      </div>
    );
  }

  // If authenticated on mobile, don't show login page (will redirect)
  if (isMobile && user && token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MealLoader customMessages={["Loading..."]} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Landing - Only visible on mobile */}
      <div className="md:hidden min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          {/* Logo */}
          <div className="mb-3">
            <img src={logo} alt="Habeat" className="w-20 h-auto" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3 leading-tight">
            Nourish Your Body,
            <br />
            Elevate Your Mind.
          </h1>
          <p className="text-center text-gray-600 text-base mb-8 max-w-sm mx-auto">
            {HABEAT_SLOGAN}
          </p>

          {/* Features List */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-gray-700">Build Healthy Eating Habits</span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">
                Mindful Nutrition, Simplified
              </span>
            </div>
          </div>
          <img
            src={foodBg}
            alt="Healthy food and nutrition"
            className="h-60 w-auto mx-auto"
          />

          {/* Buttons */}
          <div className="w-full space-y-4 mt-auto">
            <Button
              size="lg"
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-6 rounded-full text-lg"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
            <AuthModal onSuccess={() => navigate("/daily-tracker")}>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-emerald-400 text-emerald-500 hover:bg-emerald-50 font-semibold py-6 rounded-full text-lg"
              >
                Sign In
              </Button>
            </AuthModal>
          </div>
        </div>
      </div>

      {/* Desktop Landing - Hidden on mobile */}
      <div className="hidden md:block">
        {/* Hero Section */}
        <section className="relative text-white overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <img
              src={foodBg}
              alt="Healthy food and nutrition"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to <span className="text-yellow-300">Habeats</span>
              </h1>
              <p
                className="text-xl md:text-2xl mb-8 text-white font-bold max-w-3xl mx-auto"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
              >
                {HABEAT_SLOGAN}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={() => navigate("/register")}
                >
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <AuthModal onSuccess={() => navigate("/daily-tracker")}>
                  <div className="text-gray-900 hover:text-green-500 cursor-pointer">
                    Sign In
                  </div>
                </AuthModal>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {SLOGAN_EAT_WELL}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-primary rounded-full text-white">
                        <feature.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Paths Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Choose Your Path</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Whether you want to lose weight, gain muscle, or maintain a
                healthy lifestyle, we have a path for you
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-primary text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-white/80">Happy Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-white/80">Meals Tracked</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-white/80">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <Card className="max-w-3xl mx-auto text-center bg-gradient-primary text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to transform your health?
                </h2>
                <p className="text-xl mb-8 text-white/90">
                  {SLOGAN_HABITS}
                </p>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <CheckCircle className="h-5 w-5" />
                  <span>Personalized meal plans</span>
                  <CheckCircle className="h-5 w-5" />
                  <span>Progress tracking</span>
                  <CheckCircle className="h-5 w-5" />
                  <span>Community support</span>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={() => navigate("/register")}
                >
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Habeats</h3>
              <p className="text-gray-400 mb-4 max-w-xl mx-auto">
                {SLOGAN_NO_GUILT}
              </p>
              <div className="flex justify-center space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
