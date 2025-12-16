import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Criar instância na Evolution API
  app.post("/api/instance/create", async (req, res) => {
    try {
      const { instanceName, phoneNumber } = req.body;
      const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
      const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

      if (!instanceName || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Nome da instância e número são obrigatórios"
        });
      }

      if (!EVOLUTION_API_URL || !EVOLUTION_API_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "Configuração da Evolution API não encontrada"
        });
      }

      const requestBody = {
        instanceName,
        number: phoneNumber,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      };

      console.log("Criando instância:", requestBody);
      console.log("URL:", `${EVOLUTION_API_URL}/instance/create`);

      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": EVOLUTION_API_TOKEN,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Resposta Evolution API:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("Erro da Evolution API:", data);
        return res.status(response.status).json({
          success: false,
          message: data.message || "Erro ao criar instância",
          error: data
        });
      }

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar instância"
      });
    }
  });

  // Buscar QR Code da instância
  app.get("/api/instance/:instanceName/qrcode", async (req, res) => {
    try {
      const { instanceName } = req.params;
      const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
      const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

      if (!EVOLUTION_API_URL || !EVOLUTION_API_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "Configuração da Evolution API não encontrada"
        });
      }

      console.log("Buscando QR Code para:", instanceName);

      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": EVOLUTION_API_TOKEN,
          },
        }
      );

      const data = await response.json();
      console.log("Resposta QR Code:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("Erro ao buscar QR Code:", data);
        return res.status(response.status).json({
          success: false,
          message: data.message || "Erro ao buscar QR Code",
          error: data
        });
      }

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Erro ao buscar QR Code:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar QR Code"
      });
    }
  });

  // Verificar status da conexão
  app.get("/api/instance/:instanceName/status", async (req, res) => {
    try {
      const { instanceName } = req.params;
      const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
      const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

      if (!EVOLUTION_API_URL || !EVOLUTION_API_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "Configuração da Evolution API não encontrada"
        });
      }

      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": EVOLUTION_API_TOKEN,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message: data.message || "Erro ao verificar status",
          error: data
        });
      }

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao verificar status"
      });
    }
  });

  return httpServer;
}
