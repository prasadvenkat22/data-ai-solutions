import Head from 'next/head';
import Link from 'next/link';
import {
  Cloud,
  BrainCircuit,
  BarChart3,
  Cpu,
  Globe2,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Server,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

const services = [
  {
    icon: Cloud,
    title: 'Cloud Platforms',
    desc: 'End-to-end migration and architecture on AWS, Azure, and GCP. From lift-and-shift to cloud-native transformation.',
    tags: ['AWS', 'Azure', 'GCP'],
    color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30',
    iconColor: 'text-sky-400',
    href: '/services#cloud',
  },
  {
    icon: BrainCircuit,
    title: 'AI & ML Solutions',
    desc: 'Custom AI implementations using Databricks, Snowflake, and leading LLM frameworks. Bring intelligence to your data.',
    tags: ['Databricks', 'Snowflake', 'LLM'],
    color: 'from-purple-500/20 to-violet-600/20 border-purple-500/30',
    iconColor: 'text-purple-400',
    href: '/services#ai',
  },
  {
    icon: BarChart3,
    title: 'Data Analytics',
    desc: 'Transform raw data into business insights with modern data platforms, warehouses, and BI solutions.',
    tags: ['BI', 'Data Warehouse', 'ETL'],
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    href: '/services#analytics',
  },
  {
    icon: Cpu,
    title: 'Custom AI Implementations',
    desc: 'Bespoke AI solutions tailored to your industry. RAG pipelines, vector search, and generative AI agents.',
    tags: ['RAG', 'Vector DB', 'GenAI'],
    color: 'from-orange-500/20 to-rose-600/20 border-orange-500/30',
    iconColor: 'text-orange-400',
    href: '/services#custom',
  },
  {
    icon: Server,
    title: 'On-Premise to Cloud',
    desc: 'Seamless migration of legacy analytical platforms to modern cloud-native architectures with zero data loss.',
    tags: ['Migration', 'Hybrid', 'Modernization'],
    color: 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    href: '/services#cloud',
  },
  {
    icon: Shield,
    title: 'Support & Incident Resolution',
    desc: '24/7 on-shore and off-shore support teams ensuring uptime, compliance, and rapid incident resolution.',
    tags: ['24/7', 'On-shore', 'Off-shore'],
    color: 'from-rose-500/20 to-pink-600/20 border-rose-500/30',
    iconColor: 'text-rose-400',
    href: '/services',
  },
];

const stats = [
  { label: 'Projects Delivered', value: '200+', icon: CheckCircle2 },
  { label: 'Enterprise Clients', value: '80+', icon: Users },
  { label: 'Cloud Platforms', value: '3', icon: Cloud },
  { label: 'Countries Served', value: '15+', icon: Globe2 },
];

const technologies = [
  'Databricks', 'Snowflake', 'Azure', 'AWS', 'GCP',
  'Apache Spark', 'dbt', 'Airflow', 'Kafka', 'OpenAI',
];

const whyUs = [
  { icon: Globe2, title: 'Global Presence', desc: 'On-shore & off-shore teams across multiple time zones for continuous delivery.' },
  { icon: Zap, title: 'Rapid Deployment', desc: 'Proven accelerators and frameworks to go from concept to production fast.' },
  { icon: TrendingUp, title: 'ROI Focused', desc: 'Every engagement is tied to measurable business outcomes and value creation.' },
  { icon: Sparkles, title: 'AI-First Mindset', desc: 'We embed AI capabilities into every solution, not as an afterthought.' },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>DataAI Solutions — Data Analytics & AI Consulting</title>
        <meta
          name="description"
          content="Bringing AI to where data lives. Expert consulting in cloud platforms, Databricks, Snowflake, Azure, AWS, GCP and custom AI implementations."
        />
      </Head>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-900/20 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-700/50 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 text-sm font-medium">AI-Powered Data Consulting</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Data </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Solutions
              </span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed mb-4">
              Bringing AI to where data lives.
            </p>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
              We specialize in consulting solutions for data analytics and AI — new implementations,
              on-premise to cloud migrations, and custom AI for Databricks, Snowflake, Azure, AWS, and GCP.
              On-shore and off-shore presence for development, support, and incident resolution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/registrations#book"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                <CalendarIcon className="w-5 h-5" />
                Book a Free Demo
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600"
              >
                Explore Services
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <s.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive data and AI consulting across the entire technology stack.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Link
              key={svc.title}
              href={svc.href}
              className={`group relative bg-gradient-to-br ${svc.color} border rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svc.icon className={`w-6 h-6 ${svc.iconColor}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{svc.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{svc.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {svc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-900/60 text-slate-300 rounded-full px-2.5 py-1 border border-slate-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-6 right-6 text-slate-600 group-hover:text-slate-400 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why DataAI Solutions</h2>
            <p className="text-slate-400 text-lg">
              Trusted by enterprises across industries for mission-critical data transformations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Technologies We Work With</h2>
          <p className="text-slate-400">Leading platforms trusted by the world's top enterprises.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 font-medium hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-700/50 rounded-3xl px-8 py-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Data?
          </h2>
          <p className="relative text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Schedule a free 30-minute demo and see how we can bring AI to your data infrastructure.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registrations#book"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
            >
              <CalendarIcon className="w-5 h-5" />
              Schedule a Demo
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-800/60 text-white font-semibold rounded-xl hover:bg-indigo-800 border border-indigo-600/50 transition-all"
            >
              View Our Clients
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
