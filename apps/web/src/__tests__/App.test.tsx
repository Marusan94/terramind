import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('TerraMind App', () => {
  it('renders the TerraMind brand', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('TerraMind');
  });

  it('renders the sidebar layer toggles', () => {
    const { container } = render(<App />);
    const text = container.textContent || '';
    expect(text).toContain('Calidad del Aire');
    expect(text).toContain('Clima y Radar');
    expect(text).toContain('Niveles de Agua');
    expect(text).toContain('Vegetación');
  });

  it('renders the actions section', () => {
    const { container } = render(<App />);
    const text = container.textContent || '';
    expect(text).toContain('Ver Dashboard');
    expect(text).toContain('Configurar Alertas');
    expect(text).toContain('Compartir');
  });

  it('opens the dashboard overlay from the sidebar', () => {
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('📊 Ver Dashboard'));
    const text = container.textContent || '';
    expect(text).toContain('Territorio');
    expect(text).toContain('Pronóstico');
  });
});
