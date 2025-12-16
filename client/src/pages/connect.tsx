import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Smartphone, QrCode, Check, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import generatedBg from "@assets/generated_images/abstract_smooth_tech_gradient_waves_dark.png";

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
  const [step, setStep] = useState<"form" | "ready_to_scan" | "scanning" | "connected">("form");
  const [instanceData, setInstanceData] = useState<{ name: string; number: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instanceName: "",
      phoneNumber: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setInstanceData({ name: values.instanceName, number: values.phoneNumber });
      setStep("ready_to_scan");
      setIsLoading(false);
    }, 1500);
  }

  const handleShowQRCode = () => {
    setStep("scanning");
  };

  const handleSimulateScan = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStep("connected");
      setIsLoading(false);
    }, 2000);
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
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            Evolution Connect
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas instâncias do WhatsApp com facilidade.
          </p>
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
                        className="w-full h-12 text-base font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] transition-all"
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

          {step === "ready_to_scan" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Instância Criada!</CardTitle>
                  <CardDescription>
                    A instância <span className="text-foreground font-semibold">{instanceData?.name}</span> foi configurada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle>Próximo passo</AlertTitle>
                    <AlertDescription>
                      Você precisa ler o QR Code para finalizar a conexão.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleShowQRCode} 
                    className="w-full h-12 text-base font-medium"
                    data-testid="button-read-qrcode"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Ler QR Code
                  </Button>
                </CardFooter>
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
                    Abra o WhatsApp no seu celular e escaneie o código.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative p-4 bg-white rounded-xl">
                      <QRCodeSVG 
                        value={`https://wa.me/${instanceData?.number}?text=Authentication-Token-For-${instanceData?.name}`}
                        size={220}
                        level="H"
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-center text-muted-foreground space-y-1">
                    <p>1. Abra o WhatsApp no seu celular</p>
                    <p>2. Toque em Menu ou Configurações</p>
                    <p>3. Selecione Aparelhos Conectados</p>
                    <p>4. Toque em Conectar um Aparelho</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5"
                    onClick={handleSimulateScan}
                    data-testid="button-simulate-scan"
                  >
                    {isLoading ? "Conectando..." : "Simular Conexão (Demo)"}
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
              <Card className="border-primary/30 bg-primary/5 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
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