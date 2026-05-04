import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type SourceListProps = {
    results?: any[];
};

export default function SourceList({ results }: SourceListProps) {
    if (!results || results.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="mt-4 w-full">
            {results.map((result, index) => (
                <AccordionItem key={result.chunk_id} value={result.chunk_id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Source {index + 1}</Badge>
                            <span>{result.filename}</span>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {result.text}
                        </p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}