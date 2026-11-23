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

export type Perfume = { nome: string; marca: string; notas: string; ml: number; preco: number; categoria: Categoria };

export const perfumes: Perfume[] = [
  { nome: "Rose Éclat", marca: "Maison Lune", notas: "Rosa, peônia, almíscar", ml: 100, preco: 489, categoria: "Feminino" },
  { nome: "Velours Rose", marca: "Atelier Doré", notas: "Baunilha, framboesa, íris", ml: 90, preco: 559, categoria: "Feminino" },
  { nome: "Fleur de Nuit", marca: "Maison Lune", notas: "Jasmim, tuberosa, âmbar", ml: 100, preco: 619, categoria: "Feminino" },
  { nome: "Velvet Oak", marca: "Noble House", notas: "Carvalho, couro, cardamomo", ml: 100, preco: 529, categoria: "Masculino" },
  { nome: "Black Cedar", marca: "Atelier Doré", notas: "Cedro, vetiver, pimenta", ml: 100, preco: 479, categoria: "Masculino" },
  { nome: "Tabac Royal", marca: "Noble House", notas: "Tabaco, mel, fava tonka", ml: 75, preco: 649, categoria: "Masculino" },
  { nome: "Oud Majesty", marca: "Dar Al Oud", notas: "Oud, rosa, açafrão", ml: 100, preco: 399, categoria: "Árabes" },
  { nome: "Amber Sultan", marca: "Al Sahra", notas: "Âmbar, incenso, baunilha", ml: 100, preco: 349, categoria: "Árabes" },
  { nome: "Layali Gold", marca: "Dar Al Oud", notas: "Sândalo, oud, praliné", ml: 80, preco: 429, categoria: "Árabes" },
  { nome: "Lumière", marca: "Studio Blanc", notas: "Limão siciliano, neroli, chá", ml: 100, preco: 459, categoria: "Unissex" },
  { nome: "Sel Marin", marca: "Studio Blanc", notas: "Sal marinho, sálvia, musgo", ml: 100, preco: 499, categoria: "Unissex" },
  { nome: "Iris Poudre", marca: "Atelier Doré", notas: "Íris, almíscar branco, cedro", ml: 50, preco: 389, categoria: "Unissex" },
];

export const formatarPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
