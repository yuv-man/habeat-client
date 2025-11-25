import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import bgImage from "@/assets/bg-image.png";
import { paths, features } from "@/lib/paths";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <img
            src={bgImage}
            alt="Healthy food and nutrition"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">Habeat</span>
            </h1>
            <p
              className="text-xl md:text-2xl mb-8 text-white font-bold"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
            >
              Transform your relationship with food. Track habits, achieve
              goals, and build a healthier you.
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
              Habeat provides comprehensive tools to help you build sustainable
              healthy habits
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {paths.map((path, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                  <img
                    src={path.icon}
                    alt={path.label}
                    className="w-10 h-10 mb-3"
                  />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {path.label}
                  </h3>
                  <p className="text-muted-foreground">{path.description}</p>
                </CardContent>
              </Card>
            ))}
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
                Join thousands of users who have already started their journey
                to better health with Habeat.
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
            <h3 className="text-2xl font-bold mb-4">Habeat</h3>
            <p className="text-gray-400 mb-4">
              Your journey to better health starts here
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
  );
};

export default Index;
