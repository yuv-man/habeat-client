import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed bottom-6 left-6">
            <Button onClick={() => navigate('/dashboard')} className="rounded-full">
                ← Dashboard
            </Button>
        </div>
    )
}

export default BackButton;