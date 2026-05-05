import { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

const ResetChromaButton = () => {
    const [loading, setLoading] = useState(false);

    const handleResetChroma = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');  // Récupère le token depuis le localStorage

            if (!token) {
                toast.error("You must be logged in to reset ChromaDB.");
                return;
            }

            const response = await axios.delete('http://localhost:3000/api/chroma/reset', {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Ajout du token JWT dans l'en-tête
                }
            });

            if (response.status === 200) {
                toast.success("ChromaDB has been reset successfully.");
            } else {
                toast.error("Failed to reset ChromaDB.");
            }
        } catch (error) {
            toast.error("Error resetting ChromaDB: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Button onClick={handleResetChroma} disabled={loading}>
                {loading ? "Resetting..." : "Reset ChromaDB"}
            </Button>
        </div>
    );
};

export default ResetChromaButton;

