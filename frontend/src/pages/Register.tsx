import { useState } from "react";
import { register } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [curso, setCurso] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Toast de loading
    const loadingToast = toast.loading("Criando conta...");
    
    try {
      const data = await register(username, email, password, curso);
      console.log("Usuário criado:", data);
      
      // Remove loading e mostra sucesso
      toast.dismiss(loadingToast);
      toast.success("✅ Conta criada com sucesso! Redirecionando para login...", {
        duration: 3000,
      });
      
      // Redireciona para login após 1.5s
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      
      // Remove loading e mostra erro
      toast.dismiss(loadingToast);
      
      let errorMessage = "Erro ao criar conta";
      if (err.response?.status === 400) {
        if (err.response.data?.username) {
          errorMessage = "Nome de usuário já existe";
        } else if (err.response.data?.email) {
          errorMessage = "Email já está em uso";
        } else {
          errorMessage = "Dados inválidos. Verifique os campos";
        }
      } else if (!err.response) {
        errorMessage = "Servidor não respondeu. Tente novamente";
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px", width: "90%" }}>
      <h2 className="mb-4 text-center">Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Usuário</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Curso</label>
          <input
            type="text"
            className="form-control"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Criar Conta"}
        </button>
      </form>

      {/* Link para login */}
      <div className="text-center mt-3">
        <hr className="my-2" />
        <div>
          <span className="text-muted">Já tem uma conta? </span>
          <button 
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => navigate("/login")}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
