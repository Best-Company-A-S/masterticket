import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Clock,
  Code,
  ExternalLink,
  FileText,
  Github,
  Globe,
  HelpCircle,
  Lightbulb,
  Lock,
  MessageSquare,
  Rocket,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  // Current date for highlighting current quarter
  const currentDate = new Date();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  const currentYear = currentDate.getFullYear();

  // Define roadmap items
  const roadmapItems = [
    {
      id: "q2-2024",
      quarter: "Q2 2024",
      title: "Core Platform Launch",
      status: "completed",
      description:
        "Initial release of the MasterTicket platform with basic ticketing functionality.",
      features: [
        { name: "Ticket creation and management", completed: true },
        { name: "User authentication", completed: true },
        { name: "Basic dashboard", completed: true },
        { name: "Email notifications", completed: true },
      ],
      icon: <Rocket />,
    },
    {
      id: "q3-2024",
      quarter: "Q3 2024",
      title: "AI Integration",
      status: "in-progress",
      description:
        "Integrate AI capabilities to enhance ticket processing and resolution.",
      features: [
        { name: "AI-powered ticket categorization", completed: true },
        { name: "Automatic priority detection", completed: true },
        { name: "Response suggestions", completed: false },
        { name: "Sentiment analysis", completed: false },
      ],
      icon: <Sparkles />,
    },
    {
      id: "q4-2024",
      quarter: "Q4 2024",
      title: "Advanced Analytics",
      status: "planned",
      description:
        "Comprehensive analytics and reporting features for better insights.",
      features: [
        { name: "Custom dashboards", completed: false },
        { name: "Performance metrics", completed: false },
        { name: "Trend analysis", completed: false },
        { name: "Export capabilities", completed: false },
      ],
      icon: <FileText />,
    },
    {
      id: "q1-2025",
      quarter: "Q1 2025",
      title: "Enterprise Features",
      status: "planned",
      description: "Features designed for larger organizations and teams.",
      features: [
        { name: "Role-based access control", completed: false },
        { name: "Team management", completed: false },
        { name: "SLA management", completed: false },
        { name: "Advanced workflow automation", completed: false },
      ],
      icon: <Users />,
    },
    {
      id: "q2-2025",
      quarter: "Q2 2025",
      title: "Integration Ecosystem",
      status: "planned",
      description:
        "Expand the platform's integration capabilities with popular tools and services.",
      features: [
        { name: "Slack integration", completed: false },
        { name: "Microsoft Teams integration", completed: false },
        { name: "Zapier support", completed: false },
        { name: "Public API enhancements", completed: false },
      ],
      icon: <Share2 />,
    },
    {
      id: "q3-2025",
      quarter: "Q3 2025",
      title: "Mobile Experience",
      status: "planned",
      description:
        "Dedicated mobile applications and enhanced mobile experience.",
      features: [
        { name: "iOS application", completed: false },
        { name: "Android application", completed: false },
        { name: "Offline capabilities", completed: false },
        { name: "Push notifications", completed: false },
      ],
      icon: <Globe />,
    },
  ];

  // Status badge colors
  const statusColors = {
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    planned: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 text-center">
        <Badge className="mb-4" variant="outline">
          Product Roadmap
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Our Vision & Roadmap
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Explore our development plans and upcoming features for MasterTicket
        </p>
      </section>

      {/* Current Focus */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Current Focus: AI Integration
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're currently focused on enhancing MasterTicket with advanced
                AI capabilities to automate ticket processing, provide
                intelligent suggestions, and improve overall efficiency for
                support teams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Clock className="h-3 w-3 mr-1" /> Q3 2024
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Sparkles className="h-3 w-3 mr-1" /> AI Features
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Zap className="h-3 w-3 mr-1" /> Automation
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Development Timeline
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border"></div>

          {/* Timeline items */}
          <div className="space-y-24">
            {roadmapItems.map((item, index) => (
              <div
                key={item.id}
                id={item.id}
                className={`relative flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center`}
              >
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-background bg-primary flex items-center justify-center z-10">
                  {item.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                </div>

                {/* Timeline content */}
                <div
                  className={`w-full md:w-[calc(50%-2rem)] ${
                    index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  <div
                    className={`bg-card rounded-xl p-6 border shadow-md ${
                      (currentYear === 2024 &&
                        ((item.quarter === "Q2 2024" && currentQuarter === 2) ||
                          (item.quarter === "Q3 2024" &&
                            currentQuarter === 3) ||
                          (item.quarter === "Q4 2024" &&
                            currentQuarter === 4))) ||
                      (currentYear === 2025 &&
                        ((item.quarter === "Q1 2025" && currentQuarter === 1) ||
                          (item.quarter === "Q2 2025" &&
                            currentQuarter === 2) ||
                          (item.quarter === "Q3 2025" && currentQuarter === 3)))
                        ? "ring-2 ring-primary/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.quarter}
                      </Badge>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          statusColors[item.status as keyof typeof statusColors]
                        }`}
                      >
                        {item.status === "completed"
                          ? "Completed"
                          : item.status === "in-progress"
                          ? "In Progress"
                          : "Planned"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <div className="h-6 w-6 text-primary">{item.icon}</div>
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      {item.description}
                    </p>

                    <div className="space-y-2">
                      {item.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {feature.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              feature.completed
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty space for the other side */}
                <div className="hidden md:block w-full md:w-[calc(50%-2rem)]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Voting */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-card rounded-xl p-8 border shadow-md">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <ThumbsUp className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Vote on Features
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We value community input! Help us prioritize our roadmap by
                voting on features that matter most to you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="https://github.com/yourusername/masterticket/issues"
                  target="_blank"
                >
                  <Button className="gap-2">
                    <Github className="h-4 w-4" /> Vote on GitHub
                  </Button>
                </Link>
                <Link href="#suggest-feature">
                  <Button variant="outline" className="gap-2">
                    <Lightbulb className="h-4 w-4" /> Suggest a Feature
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Requests */}
      <section id="suggest-feature" className="container mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Top Feature Requests
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Dark Mode Support",
              votes: 128,
              status: "planned",
              description:
                "Add support for dark mode throughout the application.",
            },
            {
              title: "Custom Fields",
              votes: 96,
              status: "under-review",
              description: "Allow users to create custom fields for tickets.",
            },
            {
              title: "Kanban Board View",
              votes: 87,
              status: "planned",
              description: "Add a Kanban board view for ticket management.",
            },
            {
              title: "Time Tracking",
              votes: 76,
              status: "under-review",
              description: "Built-in time tracking for support agents.",
            },
            {
              title: "Knowledge Base",
              votes: 62,
              status: "planned",
              description:
                "Integrated knowledge base for self-service support.",
            },
            {
              title: "Bulk Actions",
              votes: 54,
              status: "in-progress",
              description: "Support for bulk actions on multiple tickets.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <Badge
                  variant="outline"
                  className={
                    feature.status === "planned"
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      : feature.status === "in-progress"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                  }
                >
                  {feature.status === "planned"
                    ? "Planned"
                    : feature.status === "in-progress"
                    ? "In Progress"
                    : "Under Review"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {feature.votes} votes
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Star className="h-3 w-3" /> Vote
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="https://github.com/yourusername/masterticket/issues/new"
            target="_blank"
          >
            <Button className="gap-2">
              <Lightbulb className="h-4 w-4" /> Suggest New Feature
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: "How often is the roadmap updated?",
              answer:
                "We update our roadmap quarterly to reflect our current priorities and progress. Major updates are announced on our GitHub repository and blog.",
            },
            {
              question: "How can I contribute to the project?",
              answer:
                "We welcome contributions from the community! You can contribute by submitting pull requests, reporting bugs, suggesting features, or helping with documentation. Check our GitHub repository for contribution guidelines.",
            },
            {
              question:
                "Will all features be available in the open source version?",
              answer:
                "Yes, all features on our roadmap will be available in the open source version. We're committed to keeping MasterTicket fully open source.",
            },
            {
              question: "How do you prioritize feature development?",
              answer:
                "We prioritize features based on community feedback, strategic goals, and technical dependencies. Community voting plays a significant role in our decision-making process.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-card rounded-xl p-8 md:p-12 border shadow-md text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay updated on our roadmap progress, contribute to discussions, and
            help shape the future of MasterTicket.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="https://github.com/yourusername/masterticket"
              target="_blank"
            >
              <Button className="gap-2">
                <Github className="h-4 w-4" /> GitHub
              </Button>
            </Link>
            <Link href="https://discord.gg/masterticket" target="_blank">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Discord
              </Button>
            </Link>
            <Link href="https://twitter.com/masterticket" target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" /> Twitter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
