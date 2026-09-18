# Formulário da aula EscalaMed

Landing page para a aula gratuita [Sucesso do Cliente na Clínica](https://youtu.be/BMQbF3xvaWo?si=OSA9pjvnOkzXBaV8). O visitante informa nome, e-mail, WhatsApp e Instagram; a aula é exibida imediatamente enquanto o cadastro é enviado ao funil `funil_ganchos` do Metrics em segundo plano.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `METRICS_API_KEY` em `.env.local`. Em produção, configure a mesma variável nas configurações do projeto Vercel. `METRICS_FUNNEL_ID` evita uma consulta por nome, mas a integração também funciona sem ele.

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
```

A chave do Metrics fica somente no servidor. Se o envio falhar, a aula continua disponível e o visitante pode tentar registrar o acesso novamente.
