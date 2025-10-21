import { useState } from "react";
import { login } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Toast de loading
    const loadingToast = toast.loading("Entrando...");
    
    try {
      const data = await login(email, password);
      console.log("Login OK:", data);
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      
      // Remove loading e mostra sucesso
      toast.dismiss(loadingToast);
      toast.success("Login realizado com sucesso! 🎉", {
        duration: 2000,
      });
      
      setTimeout(() => {
        navigate("/home");
      }, 500);
      
    } catch (err: any) {
      console.error("Erro no login:", err);
      
      // Remove loading e mostra erro
      toast.dismiss(loadingToast);
      
      let errorMessage = "Erro ao fazer login";
      if (err.response?.status === 401) {
        errorMessage = "Email ou senha incorretos";
      } else if (err.response?.status === 400) {
        errorMessage = "Dados inválidos";
      } else if (!err.response) {
        errorMessage = "Servidor não respondeu. Verifique sua conexão";
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "350px", maxWidth: "90vw" }}>
        <h3 className="text-center mb-3">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              disabled={loading}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Links adicionais */}
        <div className="text-center mt-3">
          <div className="mb-2">
            <button 
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueceu sua senha?
            </button>
          </div>
          <hr className="my-2" />
          <div>
            <span className="text-muted">Não tem uma conta? </span>
            <button 
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/register")}
            >
              Quero me cadastrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
