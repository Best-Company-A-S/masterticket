import { Button } from "@/components/ui/button";
import ShineText from "@/components/ui/shine-text";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  TicketCheck,
  Zap,
  Sparkles,
  Clock,
  Shield,
  Users,
  LineChart,
  Layers,
  Star,
  Infinity,
  Code,
  Database,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 text-center">
        <div className="absolute top-0 left-0 w-full h-[500px] -z-10"></div>
        <Badge className="mb-4" variant="outline">
          Open Source
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <ShineText text="MasterTicket" disabled={false} speed={2} />
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          The modern, AI-powered ticket management system designed for teams of
          all sizes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Try Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="gap-2">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview with animated gradient border */}
        <div className="relative mx-auto max-w-5xl p-1 rounded-xl  shadow-xl animate-gradient-xy">
          <div className="rounded-lg overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-full w-full opacity-0 hover:opacity-10 transition-opacity"></div>
            <div className="bg-muted/50 flex items-center px-4 py-2 border-b">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <Image
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          Everything you need to manage support tickets efficiently in one place
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <TicketCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ticket Management</h3>
            <p className="text-muted-foreground">
              Create, track, and resolve tickets with ease. Assign priorities
              and categories to stay organized.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Threaded Comments</h3>
            <p className="text-muted-foreground">
              Collaborate with your team through threaded comments. Keep all
              discussions organized in one place.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground">
              Leverage AI to summarize tickets, suggest solutions, and automate
              routine tasks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Response Time Tracking
            </h3>
            <p className="text-muted-foreground">
              Monitor and improve team performance with built-in response time
              analytics.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Secure Authentication
            </h3>
            <p className="text-muted-foreground">
              Role-based access control with secure authentication to protect
              sensitive ticket data.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">RESTful API</h3>
            <p className="text-muted-foreground">
              Integrate with your existing tools through our comprehensive REST
              API endpoints.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Work together seamlessly with role-based assignments and shared
              ticket views.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Gain insights with comprehensive reporting on ticket metrics and
              team performance.
            </p>
          </div>

          {/* Feature 9 */}
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow group">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Infinity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
            <p className="text-muted-foreground">
              Connect with your favorite tools through webhooks and our
              extensive API.
            </p>
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase with Video */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4" variant="secondary">
              Powered by AI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              AI-Powered Support Assistant
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our built-in AI assistant helps you resolve tickets faster by
              providing smart suggestions, summarizing long conversations, and
              automating repetitive tasks.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Automatic ticket summarization",
                "Smart response suggestions",
                "Priority detection",
                "Similar ticket identification",
                "Sentiment analysis",
                "Automated categorization",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/ai-assistant">
              <Button className="gap-2">
                Try AI Assistant <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative rounded-lg border shadow-xl overflow-hidden bg-card">
            <div className="bg-muted/50 flex items-center px-4 py-2 border-b">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto font-medium text-sm">
                AI Assistant Demo
              </div>
            </div>
            {/* Replace with video */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                className="w-full h-auto"
                controls
                autoPlay
                muted
                loop
                poster="/dashboard-preview.png"
              >
                <source src="/ai-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 ">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Loved by Teams Everywhere
        </h2>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          See what our users have to say about MasterTicket
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "MasterTicket has reduced our average response time by 40%. The AI assistant is a game-changer for our support team.",
              author: "Sarah Johnson",
              role: "Customer Support Manager",
              company: "TechCorp Inc.",
            },
            {
              quote:
                "The intuitive interface and powerful API make this the best ticketing system we've used. Integration was seamless.",
              author: "Michael Chen",
              role: "CTO",
              company: "StartupHub",
            },
            {
              quote:
                "We've seen a significant increase in customer satisfaction since switching to MasterTicket. The AI suggestions are surprisingly accurate.",
              author: "Emma Rodriguez",
              role: "Support Team Lead",
              company: "Global Services Ltd.",
            },
          ].map((testimonial, i) => (
            <div key={i} className="bg-card rounded-xl p-8 border shadow-md">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <blockquote className="text-lg mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Built with Modern Technology
        </h2>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          Powered by the latest web technologies for performance and reliability
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { name: "Next.js", icon: <Code className="h-8 w-8" /> },
            { name: "TypeScript", icon: <Code className="h-8 w-8" /> },
            { name: "Tailwind CSS", icon: <Layers className="h-8 w-8" /> },
            { name: "Prisma", icon: <Database className="h-8 w-8" /> },
          ].map((tech, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border flex flex-col items-center text-center"
            >
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                {tech.icon}
              </div>
              <h3 className="font-medium">{tech.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to streamline your support workflow?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of teams using MasterTicket to deliver exceptional
            customer support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://github.com/yourusername/masterticket"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2">
                GitHub Repository
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="max-w-lg">
            <h3 className="font-bold text-lg mb-4">MasterTicket</h3>
            <p className="text-muted-foreground">
              Open source ticket management system powered by AI.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Links</h3>
            <ul className="flex items-center gap-2 ">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/yourusername/masterticket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            © 2024 MasterTicket. Open source project.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
