import type { ReactNode } from "react";
import {
    ArrowRight,
    Brain,
    Cpu,
    Database,
    FileText,
    History,
    Layers,
    Lock,
    MessageSquare,
    Search,
    Server,
    ShieldCheck,
    Sparkles,
    Upload,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LandingPageProps = {
    onGoToLogin: () => void;
    onGoToRegister: () => void;
};

const workflowSteps = [
    {
        icon: <Upload className="h-5 w-5" />,
        title: "Document upload",
        description:
            "Users can upload documents such as PDF, Markdown or text files directly from the interface.",
        detail:
            "The file is sent to the backend, validated, then forwarded to the RAG service for ingestion.",
    },
    {
        icon: <FileText className="h-5 w-5" />,
        title: "Text extraction and chunking",
        description:
            "The document is transformed into smaller text chunks to make the content easier to search.",
        detail:
            "Chunking improves retrieval quality because the model can work with precise parts of the document instead of the whole file.",
    },
    {
        icon: <Database className="h-5 w-5" />,
        title: "Embeddings and vector storage",
        description:
            "Each chunk is converted into an embedding and stored in ChromaDB for semantic search.",
        detail:
            "This allows ForgeRAG to find content based on meaning, not only exact keywords.",
    },
    {
        icon: <Search className="h-5 w-5" />,
        title: "Context retrieval",
        description:
            "When the user asks a question, the most relevant chunks are retrieved from the vector database.",
        detail:
            "The retrieved context is used to make the final answer more accurate and connected to the uploaded documents.",
    },
    {
        icon: <MessageSquare className="h-5 w-5" />,
        title: "Contextual answer generation",
        description:
            "The local LLM receives the question and the retrieved context to generate a final answer.",
        detail:
            "The goal is to reduce hallucinations by forcing the model to answer from the available documentation.",
    },
];

export default function LandingPage({
                                        onGoToLogin,
                                        onGoToRegister,
                                    }: LandingPageProps) {
    return (
        <main className="min-h-screen scroll-smooth bg-transparent text-foreground">
            <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <Sparkles className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-sm font-semibold leading-none">ForgeRAG</h1>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Local AI document assistant
                            </p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <a href="#workflow" className="transition hover:text-foreground">
                            Workflow
                        </a>
                        <a href="#architecture" className="transition hover:text-foreground">
                            Architecture
                        </a>
                        <a href="#details" className="transition hover:text-foreground">
                            Details
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onGoToLogin}>
                            Sign in
                        </Button>

                        <Button onClick={onGoToRegister}>
                            Create account
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
                <div>
                    <Badge variant="outline" className="mb-6 rounded-full px-4 py-2">
                        <Lock className="mr-2 h-4 w-4" />
                        Secured RAG workflow with authentication
                    </Badge>

                    <h2 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
                        Chat with your documents using a local RAG pipeline.
                    </h2>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                        ForgeRAG is a full-stack application that allows users to upload
                        documents, generate embeddings, store them in a vector database, and
                        ask questions using a local LLM.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Button size="lg" onClick={onGoToLogin}>
                            Start using ForgeRAG
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <Button size="lg" variant="outline" onClick={onGoToRegister}>
                            Create an account
                        </Button>
                    </div>

                    <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                        <MiniStat value="React" label="Frontend" />
                        <MiniStat value="NestJS" label="Backend" />
                        <MiniStat value="FastAPI" label="RAG service" />
                    </div>
                </div>

                <Card className="overflow-hidden rounded-[2rem] border bg-card/70 shadow-2xl backdrop-blur-xl">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Live RAG pipeline</CardTitle>
                                <CardDescription>
                                    From document upload to contextual answer generation
                                </CardDescription>
                            </div>

                            <Badge className="rounded-full">Preview</Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {workflowSteps.slice(0, 4).map((step, index) => (
                                <div key={step.title} className="flex gap-4 rounded-2xl border bg-background/70 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        {step.icon}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{step.title}</p>
                                            <Badge variant="secondary" className="rounded-full">
                                                {index + 1}
                                            </Badge>
                                        </div>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            <section id="workflow" className="mx-auto max-w-7xl px-6 py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge variant="outline" className="mb-4 rounded-full">
                        Workflow
                    </Badge>

                    <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        A complete document intelligence pipeline.
                    </h2>

                    <p className="mt-4 text-lg text-muted-foreground">
                        ForgeRAG is not only a chat interface. It includes ingestion,
                        document processing, embeddings, vector search and answer generation.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workflowSteps.map((step, index) => (
                        <Card
                            key={step.title}
                            className="rounded-[1.75rem] bg-card/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    {step.icon}
                                </div>

                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl">{step.title}</CardTitle>
                                    <Badge variant="secondary" className="rounded-full">
                                        0{index + 1}
                                    </Badge>
                                </div>

                                <CardDescription>{step.description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {step.detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section id="architecture" className="border-y bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <Badge variant="outline" className="mb-4 rounded-full">
                                Architecture
                            </Badge>

                            <h2 className="text-4xl font-semibold tracking-tight">
                                Clean separation between UI, API, RAG service and database.
                            </h2>

                            <p className="mt-4 text-muted-foreground">
                                The project is split into multiple services to keep the codebase
                                clear, scalable and easier to maintain.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FeatureCard
                                icon={<Cpu className="h-5 w-5" />}
                                title="React frontend"
                                description="A modern interface for authentication, document upload and chat interaction."
                            />

                            <FeatureCard
                                icon={<Server className="h-5 w-5" />}
                                title="NestJS backend"
                                description="Handles authentication, JWT security and communication with the RAG service."
                            />

                            <FeatureCard
                                icon={<Brain className="h-5 w-5" />}
                                title="FastAPI RAG service"
                                description="Processes documents, manages retrieval and communicates with the local LLM."
                            />

                            <FeatureCard
                                icon={<Database className="h-5 w-5" />}
                                title="ChromaDB vector store"
                                description="Stores document chunks as embeddings for semantic search."
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="details" className="mx-auto max-w-7xl px-6 py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge variant="outline" className="mb-4 rounded-full">
                        Technical details
                    </Badge>

                    <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Built like a real full-stack AI project.
                    </h2>

                    <p className="mt-4 text-lg text-muted-foreground">
                        This project demonstrates backend architecture, authentication,
                        local AI integration and document retrieval.
                    </p>
                </div>

                <Tabs defaultValue="security" className="mt-16">
                    <TabsList className="mx-auto grid max-w-2xl grid-cols-3">
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="rag">RAG</TabsTrigger>
                        <TabsTrigger value="stack">Stack</TabsTrigger>
                    </TabsList>

                    <TabsContent value="security" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <FeatureCard
                                icon={<ShieldCheck className="h-5 w-5" />}
                                title="JWT authentication"
                                description="Users must authenticate before accessing the chat and protected API routes."
                            />

                            <FeatureCard
                                icon={<Lock className="h-5 w-5" />}
                                title="Protected history"
                                description="Questions and answers can be linked to authenticated users."
                            />

                            <FeatureCard
                                icon={<History className="h-5 w-5" />}
                                title="Persistent sessions"
                                description="The frontend stores the token locally to keep the user connected."
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="rag" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <FeatureCard
                                icon={<Layers className="h-5 w-5" />}
                                title="Chunking strategy"
                                description="Documents are split into smaller parts to improve retrieval precision."
                            />

                            <FeatureCard
                                icon={<Database className="h-5 w-5" />}
                                title="Vector search"
                                description="Embeddings are stored in ChromaDB and searched by semantic similarity."
                            />

                            <FeatureCard
                                icon={<Brain className="h-5 w-5" />}
                                title="Local LLM"
                                description="ForgeRAG can use a local model through LM Studio for answer generation."
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="stack" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <FeatureCard
                                icon={<Cpu className="h-5 w-5" />}
                                title="React + TypeScript"
                                description="The frontend is built with reusable components and a clean UI structure."
                            />

                            <FeatureCard
                                icon={<Server className="h-5 w-5" />}
                                title="NestJS + Prisma"
                                description="The backend manages auth, database access and API orchestration."
                            />

                            <FeatureCard
                                icon={<Brain className="h-5 w-5" />}
                                title="FastAPI + Python"
                                description="The AI service manages ingestion, retrieval and communication with the LLM."
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            <section className="border-y bg-muted/30">
                <div className="mx-auto max-w-4xl px-6 py-24">
                    <div className="text-center">
                        <Badge variant="outline" className="mb-4 rounded-full">
                            Project explanation
                        </Badge>

                        <h2 className="text-4xl font-semibold tracking-tight">
                            What happens behind the interface?
                        </h2>

                        <p className="mt-4 text-muted-foreground">
                            Each part of ForgeRAG has a specific role in the complete RAG
                            workflow.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="mt-12">
                        <AccordionItem value="frontend">
                            <AccordionTrigger>Frontend interface</AccordionTrigger>
                            <AccordionContent>
                                The frontend provides the user experience: login, register,
                                document upload, chat interface and visual feedback during
                                ingestion or answer generation.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="backend">
                            <AccordionTrigger>NestJS backend</AccordionTrigger>
                            <AccordionContent>
                                The backend acts as the secure entry point of the application.
                                It manages authentication, protects routes and sends requests to
                                the RAG service.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="rag-service">
                            <AccordionTrigger>RAG service</AccordionTrigger>
                            <AccordionContent>
                                The RAG service receives documents, extracts text, creates
                                chunks, generates embeddings, retrieves relevant context and
                                builds the prompt for the language model.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="vector-db">
                            <AccordionTrigger>Vector database</AccordionTrigger>
                            <AccordionContent>
                                ChromaDB stores the vectorized representation of document
                                chunks. This makes it possible to find relevant information
                                based on semantic similarity.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="llm">
                            <AccordionTrigger>Local LLM</AccordionTrigger>
                            <AccordionContent>
                                The local model generates the final answer using the retrieved
                                document context. This keeps the workflow close to a local-first
                                AI architecture.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-24">
                <Card className="overflow-hidden rounded-[2rem] border bg-card shadow-2xl">
                    <CardContent className="grid gap-10 p-10 md:grid-cols-[1.2fr_0.8fr] md:p-14">
                        <div>
                            <Badge className="mb-5 rounded-full">Ready to start</Badge>

                            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                                Start asking questions to your own documents.
                            </h2>

                            <p className="mt-4 max-w-2xl text-muted-foreground">
                                Create an account, upload your first document and test the full
                                RAG workflow directly inside ForgeRAG.
                            </p>
                        </div>

                        <div className="flex flex-col justify-center gap-4">
                            <Button size="lg" onClick={onGoToRegister}>
                                Create an account
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <Button size="lg" variant="outline" onClick={onGoToLogin}>
                                I already have an account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}

type MiniStatProps = {
    value: string;
    label: string;
};

function MiniStat({ value, label }: MiniStatProps) {
    return (
        <Card className="rounded-2xl bg-card/70">
            <CardContent className="p-4">
                <p className="text-sm font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
    );
}

type FeatureCardProps = {
    icon: ReactNode;
    title: string;
    description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <Card className="rounded-[1.5rem] bg-card/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="leading-6">{description}</CardDescription>
            </CardHeader>
        </Card>
    );
}