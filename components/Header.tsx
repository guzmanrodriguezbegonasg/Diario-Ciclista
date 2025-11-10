import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Diario Ciclista</h1>
      <p className="text-slate-400 text-sm sm:text-base">Registra cada pedalada hacia tus metas</p>
    </header>
  );
};

export default Header;
