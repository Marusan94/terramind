---
name: research-agent
description: Powers RAG over scientific literature, arXiv, PubMed, environmental impact PDFs, and extracts verified DOI citations for Terramind.
---

# 🔬 Research Agent Skill — Terramind

## Role Overview
The Research Agent skill manages document ingestion, semantic chunking, embedding generation, and contextual retrieval for academic papers, municipal impact assessments, and environmental reports.

## Ingestion & RAG Pipeline
1. **Document Parsing**:
   - Parse PDFs using PyPDF / PaddleOCR.
   - Extract title, abstract, authors, DOI, year, and structured body text.
2. **Chunking Strategy**:
   - Recursive character chunking (500-800 tokens) with 100-token overlap.
   - Attach metadata to each chunk: `{document_title, doi, page_number, region_tag}`.
3. **Retrieval & Citation**:
   - Execute hybrid dense-sparse search against PostgreSQL `pgvector`.
   - Re-rank top-k chunks.
   - Format answer with mandatory attribution markers: `[Author et al., Year, DOI]`.
