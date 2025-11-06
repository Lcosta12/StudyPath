import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaUpload, FaSpinner, FaCheck, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

interface Materia {
  id: number;
  nome: string;
  status: "concluida" | "pendente";
}

const HomePage: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string>("");
  const [loadingStatus, setLoadingStatus] = useState<{[key: number]: boolean}>({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access");
      
      if (!token) {
        console.log("Token não encontrado, redirecionando para login");
        toast.error("Sessão expirada. Faça login novamente", {
          duration: 3000,
        });
        navigate("/login");
        return;
      }

      try {
  await axios.get("https://lcosta1209.pythonanywhere.com/materias/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Token válido");
      } catch (error) {
        console.log("Token inválido, removendo e redirecionando");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        toast.error("Sessão expirada. Faça login novamente", {
          duration: 3000,
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const concluidas = materias.filter((m) => m.status === "concluida").length;
  const pendentes = materias.filter((m) => m.status === "pendente").length;

  const data = [
    { name: "Concluídas", value: concluidas },
    { name: "Pendentes", value: pendentes },
  ];

  const COLORS = ["#4caf50", "#9e9e9e"];

  useEffect(() => {
    carregarMaterias();
  }, []);

  const carregarMaterias = async () => {
    try {
      const token = localStorage.getItem("access");
  const response = await axios.get("https://lcosta1209.pythonanywhere.com/materias/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMaterias(response.data);
      
      if (response.data.length === 0) {
        toast("Nenhuma matéria encontrada. Importe um arquivo para começar!", {
          icon: "ℹ️",
          duration: 4000,
        });
      }
      
    } catch (error: any) {
      console.error("Erro ao carregar matérias:", error);
      if (error.response?.status !== 401) {
        toast.error("Erro ao carregar matérias", {
          duration: 4000,
        });
      }
    }
  };

  const toggleStatusMateria = async (materiaId: number, novoStatus: "pendente" | "concluida") => {
    try {
      setLoadingStatus(prev => ({...prev, [materiaId]: true}));
      
      const token = localStorage.getItem("access");
      await axios.patch(
        `https://lcosta1209.pythonanywhere.com/materias/${materiaId}/`,
        { status: novoStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setMaterias(prev => 
        prev.map(materia => 
          materia.id === materiaId 
            ? { ...materia, status: novoStatus }
            : materia
        )
      );

      const statusText = novoStatus === "concluida" ? "concluída" : "pendente";
      toast.success(`Matéria marcada como ${statusText}!`, {
        duration: 2000,
      });
      
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      
      let errorMessage = "Erro ao alterar status da matéria";
      if (error.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente";
      } else if (error.response?.status === 404) {
        errorMessage = "Matéria não encontrada";
      }
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setLoadingStatus(prev => ({...prev, [materiaId]: false}));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setArquivo(event.target.files[0]);
      setMensagem("");
    }
  };

  const handleUpload = async () => {
    if (!arquivo) {
      toast.error("Selecione um arquivo primeiro!");
      return;
    }

    console.log("Iniciando upload do arquivo:", arquivo.name);
    
    const formData = new FormData();
    formData.append("arquivo", arquivo);

    const loadingToast = toast.loading("Importando arquivo...");

    try {
      setLoading(true);
      
  console.log("📡 Fazendo requisição para:", "https://lcosta1209.pythonanywhere.com/materias/importar/");
      
      const token = localStorage.getItem("access");
      const response = await axios.post(
        "https://lcosta1209.pythonanywhere.com/materias/importar/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, 
        }
      );

      console.log("Resposta recebida:", response.data);

      const novasMaterias = response.data.materias || response.data || [];
      setMaterias(novasMaterias);
      
      toast.dismiss(loadingToast);
      toast.success(`Arquivo importado com sucesso! ${novasMaterias.length} matérias carregadas.`, {
        duration: 4000,
      });
      
      setArquivo(null);
      
    } catch (error: any) {
      console.error(" Erro completo:", error);
      
      let mensagemErro = "Erro ao importar arquivo";
      
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);
        mensagemErro = `Erro ${error.response.status}: ${error.response.data?.message || error.response.data?.detail || "Erro no servidor"}`;
      } else if (error.request) {
        console.error("Sem resposta do servidor:", error.request);
        mensagemErro = "Servidor não respondeu. Verifique se o backend está rodando";
      } else if (error.code === 'ECONNABORTED') {
        mensagemErro = "Timeout: Arquivo muito grande ou servidor lento";
      } else {
        console.error("Erro de configuração:", error.message);
        mensagemErro = `Erro: ${error.message}`;
      }
      
      toast.dismiss(loadingToast);
      toast.error(mensagemErro, {
        duration: 6000,
      });
      
    } finally {
      setLoading(false);
      console.log("🏁 Upload finalizado");
    }
  };

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    toast.success("Logout realizado com sucesso!", {
      duration: 2000,
    });
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1 d-flex align-items-center">
             <span className="d-none d-md-inline ms-2">StudyPath - Gestor de Matérias</span>
            <span className="d-inline d-md-none ms-2">StudyPath</span>
          </span>
          
          <div className="d-flex align-items-center gap-2">
            <span className="text-white me-2 d-none d-sm-inline">
              Bem-vindo!
            </span>
            
            {materias.length > 0 && (
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todas as matérias?')) {
                    setMaterias([]);
                    toast.success('Matérias limpas com sucesso!', { duration: 2000 });
                  }
                }}
                title="Limpar todas as matérias"
              >
                <span className="d-none d-sm-inline">Limpar</span>
                <span className="d-inline d-sm-none"></span>
              </button>
            )}
            
            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
              title="Sair do sistema"
            >
              <span className="d-none d-sm-inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-light py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">
                 Progresso: {materias.length > 0 ? `${Math.round((concluidas / materias.length) * 100)}% concluído` : 'Nenhuma matéria cadastrada'}
              </h5>
            </div>
            <div className="col-md-6">
              <div className="progress" style={{ height: '25px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${materias.length > 0 ? (concluidas / materias.length) * 100 : 0}%` }}
                  aria-valuenow={materias.length > 0 ? (concluidas / materias.length) * 100 : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {materias.length > 0 && `${concluidas}/${materias.length} matérias`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">

      <div className="card mb-4 p-3 text-center">
        <FaUpload size={40} className="mb-3 text-secondary" />
        <p>Selecione seu arquivo e clique em enviar</p>
        
        <input
          type="file"
          accept=".xls,.xlsx,.pdf"
          onChange={handleFileChange}
          className="form-control mb-2"
          disabled={loading}
        />
        
        {arquivo && !loading && (
          <p className="text-success">Arquivo selecionado: {arquivo.name}</p>
        )}
        
        {mensagem && (
          <div className="alert alert-info mt-2">
            {mensagem}
          </div>
        )}
        
        <button
          className={`btn ${loading ? "btn-secondary" : "btn-primary"} mt-2`}
          style={{ width: "150px", padding: "6px 12px", fontSize: "0.95rem", display: "block" }}
          onClick={handleUpload}
          disabled={loading || !arquivo}
        >
          {loading ? (
            <>
              <FaSpinner className="fa-spin me-1" />
              Enviando...
            </>
          ) : (
            "Enviar Arquivo"
          )}
        </button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Matéria</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
            <tbody>
              {materias.length > 0 ? (
                materias.map((materia) => (
                  <tr key={materia.id}>
                    <td>{materia.nome}</td>
                    <td>
                      <span className={`badge ${materia.status === "concluida" ? "bg-success" : "bg-warning"}`}>
                        {materia.status === "concluida" ? (
                          <>
                            <FaCheck className="me-1" />
                            Concluída
                          </>
                        ) : (
                          <>
                            <FaClock className="me-1" />
                            Pendente
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          materia.status === "concluida" 
                            ? "btn-outline-warning" 
                            : "btn-outline-success"
                        }`}
                        onClick={() => toggleStatusMateria(
                          materia.id, 
                          materia.status === "concluida" ? "pendente" : "concluida"
                        )}
                        disabled={loadingStatus[materia.id]}
                      >
                        {loadingStatus[materia.id] ? (
                          <FaSpinner className="fa-spin" />
                        ) : materia.status === "concluida" ? (
                          <>
                            <FaClock className="me-1" />
                            Marcar Pendente
                          </>
                        ) : (
                          <>
                            <FaCheck className="me-1" />
                            Marcar Concluída
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    Nenhuma matéria cadastrada ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="col-md-6 d-flex flex-column align-items-center">
          <h5>
            {materias.length > 0
              ? `${Math.round(
                  (concluidas / materias.length) * 100
                )}% do curso concluído`
              : "Nenhum progresso ainda"}
          </h5>
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    materias.length > 0
                      ? COLORS[index % COLORS.length]
                      : "#e0e0e0"
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HomePage;
