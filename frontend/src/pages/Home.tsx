import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaUpload, FaSpinner, FaCheck, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
  const [tipoMensagem, setTipoMensagem] = useState<"success" | "error" | "">("");
  const [loadingStatus, setLoadingStatus] = useState<{[key: number]: boolean}>({});
  const navigate = useNavigate();

  // Verificação de autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access");
      
      if (!token) {
        console.log(" Token não encontrado, redirecionando para login");
        navigate("/");
        return;
      }

      try {
        await axios.get("http://127.0.0.1:8000/materias/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Token válido");
      } catch (error) {
        console.log("❌ Token inválido, removendo e redirecionando");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Contagem
  const concluidas = materias.filter((m) => m.status === "concluida").length;
  const pendentes = materias.filter((m) => m.status === "pendente").length;

  const data = [
    { name: "Concluídas", value: concluidas },
    { name: "Pendentes", value: pendentes },
  ];

  const COLORS = ["#4caf50", "#9e9e9e"];

  // Carrega matérias existentes ao iniciar
  useEffect(() => {
    carregarMaterias();
  }, []);

  const carregarMaterias = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.get("http://localhost:8000/materias/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMaterias(response.data);
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
    }
  };

  const toggleStatusMateria = async (materiaId: number, novoStatus: "pendente" | "concluida") => {
    try {
      setLoadingStatus(prev => ({...prev, [materiaId]: true}));
      
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://localhost:8000/materias/${materiaId}/`,
        { status: novoStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Atualiza o estado local
      setMaterias(prev => 
        prev.map(materia => 
          materia.id === materiaId 
            ? { ...materia, status: novoStatus }
            : materia
        )
      );
      
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setMensagem("❌ Erro ao alterar status da matéria");
      setTipoMensagem("error");
    } finally {
      setLoadingStatus(prev => ({...prev, [materiaId]: false}));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setArquivo(event.target.files[0]);
      setMensagem(""); // Limpa mensagens anteriores
    }
  };

  const handleUpload = async () => {
    if (!arquivo) {
      setMensagem("⚠️ Selecione um arquivo primeiro!");
      setTipoMensagem("error");
      return;
    }

    console.log("🚀 Iniciando upload do arquivo:", arquivo.name);
    
    const formData = new FormData();
    formData.append("arquivo", arquivo);

    try {
      setLoading(true);
      setMensagem("📤 Enviando arquivo...");
      setTipoMensagem("");
      
      console.log("📡 Fazendo requisição para:", "http://localhost:8000/materias/importar/");
      
      const token = localStorage.getItem("access");
      const response = await axios.post(
        "http://localhost:8000/materias/importar/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 segundos timeout
        }
      );

      console.log("✅ Resposta recebida:", response.data);

      // Se sua API retorna { materias: [...] }
      const novasMaterias = response.data.materias || response.data || [];
      setMaterias(novasMaterias);
      
      setMensagem(`✅ Arquivo importado com sucesso! ${novasMaterias.length} matérias carregadas.`);
      setTipoMensagem("success");
      
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      
      let mensagemErro = "❌ Erro ao importar arquivo";
      
      if (error.response) {
        // Servidor respondeu com erro
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);
        mensagemErro = `❌ Erro ${error.response.status}: ${error.response.data?.message || error.response.data?.detail || "Erro no servidor"}`;
      } else if (error.request) {
        // Requisição foi feita mas sem resposta
        console.error("Sem resposta do servidor:", error.request);
        mensagemErro = "❌ Servidor não respondeu. Verifique se o backend está rodando.";
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        mensagemErro = "❌ Timeout: Arquivo muito grande ou servidor lento.";
      } else {
        // Erro na configuração
        console.error("Erro de configuração:", error.message);
        mensagemErro = `❌ Erro: ${error.message}`;
      }
      
      setMensagem(mensagemErro);
      setTipoMensagem("error");
      
    } finally {
      setLoading(false);
      console.log("🏁 Upload finalizado");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestor de Matérias</h2>

      {/* Upload Section */}
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
          <p className="text-success">📂 Arquivo selecionado: {arquivo.name}</p>
        )}
        
        {/* Mensagens de feedback */}
        {mensagem && (
          <div className={`alert ${tipoMensagem === "success" ? "alert-success" : tipoMensagem === "error" ? "alert-danger" : "alert-info"} mt-2`}>
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
        {/* Tabela */}
        <div className="col-md-6">
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
                    Nenhuma matéria cadastrada ainda 📚
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gráfico */}
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
  );
};

export default HomePage;
