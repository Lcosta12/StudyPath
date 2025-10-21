import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Toast de loading
    const loadingToast = toast.loading("Enviando solicitação...");
    
    try {
      // TODO: Aqui você vai integrar com n8n posteriormente
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Por enquanto, simular sucesso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove loading e mostra sucesso
      toast.dismiss(loadingToast);
      toast.success("📧 Instruções enviadas para seu email!", {
        duration: 4000,
      });
      
      // Opcional: redirecionar para login após alguns segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);
      
      // Remove loading e mostra erro
      toast.dismiss(loadingToast);
      toast.error("Erro ao enviar solicitação. Tente novamente.", {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "400px", maxWidth: "90vw" }}>
        <h3 className="text-center mb-3">Esqueceu sua senha?</h3>
        <p className="text-muted text-center mb-4">
          Digite seu email para receber instruções de recuperação de senha.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email cadastrado"
              disabled={loading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        {/* Links adicionais */}
        <div className="text-center">
          <button 
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => navigate("/login")}
          >
            ← Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;