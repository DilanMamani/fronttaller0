import { Heart, Book, Users, Cross } from 'lucide-react';

export default function HeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 xl:p-16 text-white">
        <div className="max-w-lg text-center">
          {/* Icono decorativo */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
            <Heart className="w-10 h-10 text-accent-gold fill-accent-gold" />
          </div>
          
          {/* frase inspiradora */}
          <h3 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Crece en fe y comunidad
          </h3>
          <p className="text-lg xl:text-xl text-gray-300 leading-relaxed mb-8">
            "Porque donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos" - Mateo 18:20
          </p>
        </div>
      </div>
      
      {/* elementos flotantes decorativos - forma de cruz */}
      <div className="absolute bottom-8 left-8">
        <Cross className="w-16 h-16 text-accent-gold opacity-20 animate-pulse" />
      </div>
      <div className="absolute top-1/4 right-12 w-12 h-12 border-2 border-white rounded-full opacity-10"></div>
      <div className="absolute top-1/3 left-1/4">
        <Heart className="w-8 h-8 text-accent-gold opacity-20 blur-sm" />
      </div>
    </div>
  );
}