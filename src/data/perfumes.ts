import feminino from "@/assets/cat-feminino.jpg";
import masculino from "@/assets/cat-masculino.jpg";
import arabe from "@/assets/cat-arabe.jpg";
import unissex from "@/assets/cat-unissex.jpg";

export type Categoria = "Feminino" | "Masculino" | "Árabes" | "Unissex";

export const categorias: { nome: Categoria; descricao: string; imagem: string }[] = [
  { nome: "Feminino", descricao: "Florais, doces e envolventes", imagem: feminino },
  { nome: "Masculino", descricao: "Amadeirados e marcantes", imagem: masculino },
  { nome: "Árabes", descricao: "Oud, âmbar e intensidade", imagem: arabe },
  { nome: "Unissex", descricao: "Frescos e elegantes", imagem: unissex },
];

export const formatarPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
