import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import generatedBg from "@assets/generated_images/abstract_smooth_tech_gradient_waves_dark.png";
import logo from "@uploads/logo.png";

// Validation Schema
const formSchema = z.object({
  instanceName: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "O nome não pode conter espaços ou acentos"),
  phoneNumber: z
    .string()
    .min(10, "Informe um número válido com DDD")
    .regex(/^\d+$/, "Apenas números são permitidos"),
});

export default function ConnectPage() {
  const [step, setStep] = useState<"form" | "scanning" | "connected">("form");
  const [instanceData, setInstanceData] = useState<{ name: string; number: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instanceName: "",
      phoneNumber: "",
    },
  });

  // Verificar status da conexão periodicamente
  useEffect(() => {
    if (step === "scanning" && instanceData?.name) {
      statusIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/instance/${instanceData.name}/status`);
          const result = await response.json();

          if (result.success && result.data?.instance?.state === "open") {
            setStep("connected");
            if (statusIntervalRef.current) {
              clearInterval(statusIntervalRef.current);
            }
          }
        } catch (err) {
          console.error("Erro ao verificar status:", err);
        }
      }, 3000);

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
      };
    }
  }, [step, instanceData?.name]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      // Criar instância na Evolution API
      const response = await fetch("/api/instance/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: values.instanceName,
          phoneNumber: values.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Erro ao criar instância");
        setIsLoading(false);
        return;
      }

      setInstanceData({ name: values.instanceName, number: values.phoneNumber });

      // Buscar QR Code
      await fetchQRCode(values.instanceName);

      setStep("scanning");
    } catch (err) {
      setError("Erro de conexão com o servidor");
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchQRCode(instanceName: string) {
    try {
      const response = await fetch(`/api/instance/${instanceName}/qrcode`);
      const result = await response.json();

      if (result.success && result.data?.base64) {
        setQrCodeBase64(result.data.base64);
      } else if (result.success && result.data?.pairingCode) {
        // Alguns casos retornam pairingCode ao invés de QR
        setQrCodeBase64(null);
      }
    } catch (err) {
      console.error("Erro ao buscar QR Code:", err);
    }
  }

  const handleRefreshQRCode = async () => {
    if (instanceData?.name) {
      setIsLoading(true);
      await fetchQRCode(instanceData.name);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${generatedBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Abstract Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <div className="mb-8 text-center">
          <img
            src={logo}
            alt="Logo"
            className="h-24 mx-auto"
          />
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle>Nova Instância</CardTitle>
                  <CardDescription>
                    Configure os dados para conectar seu WhatsApp.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="instanceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Instância</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: atendimento01"
                                {...field}
                                className="bg-background/50 border-white/5 focus:border-primary/50 transition-colors h-12"
                                data-testid="input-instance-name"
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-[0.8rem] text-muted-foreground/60">
                              Sem espaços ou acentos.
                            </p>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="5511999999999"
                                {...field}
                                className="bg-background/50 border-white/5 focus:border-primary/50 transition-colors h-12"
                                data-testid="input-phone-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.6)] transition-all"
                        disabled={isLoading}
                        data-testid="button-create"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            Criar Instância
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle>Conectar WhatsApp</CardTitle>
                  <CardDescription>
                    Escaneie o QR Code com seu WhatsApp para conectar a instância <span className="text-foreground font-semibold">{instanceData?.name}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative p-4 bg-white rounded-xl">
                      {qrCodeBase64 ? (
                        <img
                          src={qrCodeBase64}
                          alt="QR Code"
                          className="w-[220px] h-[220px]"
                        />
                      ) : (
                        <div className="w-[220px] h-[220px] flex items-center justify-center">
                          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-center text-muted-foreground space-y-1">
                    <p>1. Abra o WhatsApp no seu celular</p>
                    <p>2. Toque em Menu ou Configurações</p>
                    <p>3. Selecione Aparelhos Conectados</p>
                    <p>4. Toque em Conectar um Aparelho</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Aguardando conexão...</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/5"
                    onClick={handleRefreshQRCode}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Atualizar QR
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setStep("form");
                      setQrCodeBase64(null);
                      setError(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === "connected" && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Card className="border-primary/30 bg-primary/5 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)]">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Conectado com Sucesso!</h2>
                    <p className="text-muted-foreground">
                      A instância <span className="text-primary font-medium">{instanceData?.name}</span> está online e pronta para uso.
                    </p>
                  </div>

                  <div className="w-full p-4 bg-background/40 rounded-lg border border-white/5 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-primary font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-muted-foreground">Número</span>
                      <span className="text-foreground">{instanceData?.number}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    variant="ghost"
                    onClick={() => {
                      setStep("form");
                      setQrCodeBase64(null);
                      setInstanceData(null);
                      setError(null);
                      form.reset();
                    }}
                  >
                    Criar Nova Instância
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}