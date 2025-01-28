import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">IBC CONNECT</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-primary"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-primary"
              onClick={() => navigate("/alunos")}
            >
              Alunos
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-primary"
              onClick={() => navigate("/frequencia")}
            >
              Frequência
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={() => {
                  navigate("/dashboard");
                  setIsOpen(false);
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={() => {
                  navigate("/alunos");
                  setIsOpen(false);
                }}
              >
                Alunos
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={() => {
                  navigate("/frequencia");
                  setIsOpen(false);
                }}
              >
                Frequência
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};