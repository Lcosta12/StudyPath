import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaUpload } from "react-icons/fa";
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

  // Contagem
  const concluidas = materias.filter((m) => m.status === "concluida").length;
  const pendentes = materias.filter((m) => m.status === "pendente").length;

  const data = [
    { name: "Concluídas", value: concluidas },
    { name: "Pendentes", value: pendentes },
  ];

  const COLORS = ["#4caf50", "#9e9e9e"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setArquivo(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!arquivo) {
      alert("Selecione um arquivo primeiro!");
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/materias/importar/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Se sua API retorna { materias: [...] }
      setMaterias(response.data.materias || []);
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      alert("Erro ao importar arquivo");
    } finally {
      setLoading(false);
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
        />
        {arquivo && (
          <p className="text-success">📂 Arquivo selecionado: {arquivo.name}</p>
        )}
        <button
          className="btn btn-primary mt-2"
          style={{ width: "150px", padding: "6px 12px", fontSize: "0.95rem", display: "block" }}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Arquivo"}
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
              </tr>
            </thead>
            <tbody>
              {materias.length > 0 ? (
                materias.map((materia, index) => (
                  <tr key={index}>
                    <td>{materia.nome}</td>
                    <td>
                      {materia.status === "concluida"
                        ? "✔️ Concluída"
                        : "⏳ Pendente"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center text-muted">
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
              {data.map((entry, index) => (
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
