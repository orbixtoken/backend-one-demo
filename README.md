# Projeto_ArguzOne

Sistema de gestão unificado desenvolvido pela **Arguz Tech**, projetado para atender
diferentes segmentos como **farmácias, oficinas, lojas e comércios em geral**,
utilizando uma base única e reutilizável.

---

## 🚀 Tecnologias

- Node.js
- Express
- PostgreSQL
- JWT (Autenticação)
- bcrypt (Hash de senha)

---

## 🔐 Autenticação e Usuários

- Login via **email + senha**
- Usuários são criados **exclusivamente pelo ADMIN**
- O usuário **não redefine senha**
- Toda redefinição é feita pelo ADMIN

### Níveis de permissão

| Perfil   | Permissões |
|--------|------------|
| Admin  | Acesso total, cria usuários e produtos |
| Gerente | Não gerencia usuários, resto completo |
| Usuário | Apenas visualiza produtos e realiza vendas |

---

## 📦 Produtos / Estoque

Campos principais:
- Nome do produto
- Valor pago
- Valor final
- Quantidade
- Data de criação
- Data de validade (opcional)

### Funcionalidades
- Controle automático de estoque
- Estoque reduzido ao confirmar venda
- Aviso de produtos próximos do vencimento (Admin e Gerente)

---

## 🧾 Ordens / Vendas

- Uma ordem pode conter múltiplos produtos
- Ao confirmar a venda:
  - Estoque é atualizado automaticamente
  - Ordem fica registrada no histórico

---

## 📁 Estrutura do Projeto

```txt
src/
├─ controllers/
├─ routes/
├─ middlewares/
├─ models/
├─ utils/
├─ config/
└─ app.js
