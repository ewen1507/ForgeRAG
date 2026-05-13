import type { ReactNode } from "react";
import { GradFlow } from "gradflow";

type AppBackgroundProps = {
    children: ReactNode;
};

export default function AppBackground({ children }: AppBackgroundProps) {
    return (
        <div className="relative min-h-screen overflow-x-hidden text-foreground">
            <div className="fixed inset-0 z-0">
                <GradFlow
                    className="h-full w-full"
                    config={{
                        color1: { r: 189, g: 136, b: 109 },
                        color2: { r: 158, g: 184, b: 175 },
                        color3: { r: 179, g: 191, b: 146 },
                        speed: 0.9,
                        scale: 2,
                        type: 'animated',
                        noise: 0.18
                    }}
                />

                <div className="absolute inset-0 bg-white/55" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(2,6,23,0.45),transparent_45%)]" />
            </div>

            <div className="relative z-10 min-h-screen">{children}</div>
        </div>
    );
}
